import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex")}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = request.headers.get("x-github-event");
    const payload = JSON.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Procesar diferentes tipos de eventos
    switch (event) {
      case "push":
        await handlePushEvent(payload, supabase);
        break;

      case "pull_request":
        await handlePullRequestEvent(payload, supabase);
        break;

      case "create":
        await handleCreateEvent(payload, supabase);
        break;

      case "delete":
        await handleDeleteEvent(payload, supabase);
        break;

      case "release":
        await handleReleaseEvent(payload, supabase);
        break;

      case "workflow_run":
        await handleWorkflowRunEvent(payload, supabase);
        break;

      default:
        console.log(`Unhandled event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handlePushEvent(payload: any, supabase: any) {
  const { repository, ref, commits, sender } = payload;
  const branch = ref.replace("refs/heads/", "");

  // Buscar proyectos que usen este repositorio
  const { data: projects } = await supabase
    .from("deploy_projects")
    .select("*")
    .eq("repository", repository.full_name)
    .eq("status", "active");

  for (const project of projects || []) {
    // Verificar si el branch está configurado para auto-deploy
    const { data: environments } = await supabase
      .from("deploy_environments")
      .select("*")
      .eq("project_id", project.id)
      .eq("auto_deploy", true)
      .contains("auto_deploy_branches", [branch]);

    for (const environment of environments || []) {
      // Crear deployment automático
      await supabase.from("deploy_deployments").insert({
        project_id: project.id,
        environment_id: environment.id,
        commit_sha: commits[0]?.id || "unknown",
        commit_message: commits[0]?.message || "Push event",
        branch,
        status: "pending",
        phase: "init",
        trigger_type: "webhook",
        trigger_data: {
          event: "push",
          sender: sender?.login,
          commits_count: commits.length,
        },
      });
    }
  }
}

async function handlePullRequestEvent(payload: any, supabase: any) {
  const { repository, pull_request, action } = payload;

  if (action === "opened" || action === "synchronize") {
    // Buscar proyectos con preview deploys habilitados
    const { data: projects } = await supabase
      .from("deploy_projects")
      .select("*")
      .eq("repository", repository.full_name)
      .eq("status", "active");

    for (const project of projects || []) {
      const { data: environments } = await supabase
        .from("deploy_environments")
        .select("*")
        .eq("project_id", project.id)
        .eq("preview_deploys", true);

      for (const environment of environments || []) {
        await supabase.from("deploy_deployments").insert({
          project_id: project.id,
          environment_id: environment.id,
          commit_sha: pull_request.head.sha,
          commit_message: `PR #${pull_request.number}: ${pull_request.title}`,
          branch: pull_request.head.ref,
          pull_request_id: pull_request.id.toString(),
          status: "pending",
          phase: "init",
          trigger_type: "webhook",
          trigger_data: {
            event: "pull_request",
            action,
            pr_number: pull_request.number,
            pr_title: pull_request.title,
          },
        });
      }
    }
  }
}

async function handleCreateEvent(payload: any, supabase: any) {
  const { repository, ref, ref_type, sender } = payload;

  if (ref_type === "tag") {
    // Buscar proyectos que desplieguen en releases
    const { data: projects } = await supabase
      .from("deploy_projects")
      .select("*")
      .eq("repository", repository.full_name)
      .eq("status", "active");

    for (const project of projects || []) {
      const { data: environments } = await supabase
        .from("deploy_environments")
        .select("*")
        .eq("project_id", project.id)
        .eq("deploy_strategy", "tag-based");

      for (const environment of environments || []) {
        await supabase.from("deploy_deployments").insert({
          project_id: project.id,
          environment_id: environment.id,
          commit_sha: "tag-" + ref,
          commit_message: `Release: ${ref}`,
          branch: ref,
          status: "pending",
          phase: "init",
          trigger_type: "webhook",
          trigger_data: {
            event: "create",
            ref_type,
            ref,
            sender: sender?.login,
          },
        });
      }
    }
  }
}

async function handleDeleteEvent(payload: any, supabase: any) {
  const { repository, ref, ref_type } = payload;

  if (ref_type === "branch") {
    // Limpiar deployments de branches eliminados
    await supabase
      .from("deploy_deployments")
      .update({ status: "cancelled" })
      .eq("branch", ref)
      .eq("status", "pending");
  }
}

async function handleReleaseEvent(payload: any, supabase: any) {
  const { repository, release, action } = payload;

  if (action === "published") {
    const { data: projects } = await supabase
      .from("deploy_projects")
      .select("*")
      .eq("repository", repository.full_name)
      .eq("status", "active");

    for (const project of projects || []) {
      const { data: environments } = await supabase
        .from("deploy_environments")
        .select("*")
        .eq("project_id", project.id)
        .eq("deploy_strategy", "release-based");

      for (const environment of environments || []) {
        await supabase.from("deploy_deployments").insert({
          project_id: project.id,
          environment_id: environment.id,
          commit_sha: release.target_commitish,
          commit_message: `Release: ${release.tag_name}`,
          branch: release.target_commitish,
          status: "pending",
          phase: "init",
          trigger_type: "webhook",
          trigger_data: {
            event: "release",
            action,
            release_tag: release.tag_name,
            release_name: release.name,
          },
        });
      }
    }
  }
}

async function handleWorkflowRunEvent(payload: any, supabase: any) {
  const { repository, workflow_run, action } = payload;

  if (action === "completed") {
    // Actualizar estado de deployments basado en workflow runs
    const { data: deployments } = await supabase
      .from("deploy_deployments")
      .select("*")
      .eq("commit_sha", workflow_run.head_sha)
      .eq("status", "building");

    for (const deployment of deployments || []) {
      const newStatus =
        workflow_run.conclusion === "success" ? "success" : "failed";

      await supabase
        .from("deploy_deployments")
        .update({
          status: newStatus,
          phase: "complete",
          completed_at: new Date().toISOString(),
          workflow_run_id: workflow_run.id,
        })
        .eq("id", deployment.id);
    }
  }
}
