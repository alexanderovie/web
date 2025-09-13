import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const environmentId = searchParams.get("environmentId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("deploy_deployments")
      .select(
        `
        *,
        deploy_projects!inner (
          id,
          name,
          slug,
          user_id
        ),
        deploy_environments (
          id,
          name,
          slug
        )
      `,
      )
      .eq("deploy_projects.user_id", session.user.email);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    if (environmentId) {
      query = query.eq("environment_id", environmentId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: deployments, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching deployments:", error);
      return NextResponse.json(
        { error: "Error al obtener deployments" },
        { status: 500 },
      );
    }

    // Obtener total para paginación
    let countQuery = supabase
      .from("deploy_deployments")
      .select("id", { count: "exact", head: true })
      .eq("deploy_projects.user_id", session.user.email);

    if (projectId) {
      countQuery = countQuery.eq("project_id", projectId);
    }

    if (environmentId) {
      countQuery = countQuery.eq("environment_id", environmentId);
    }

    if (status) {
      countQuery = countQuery.eq("status", status);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: deployments,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/deploy/deployments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      environmentId,
      commitSha,
      commitMessage,
      branch,
      pullRequestId,
    } = body;

    if (!projectId || !environmentId || !commitSha || !branch) {
      return NextResponse.json(
        {
          error: "projectId, environmentId, commitSha y branch son requeridos",
        },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Verificar que el proyecto pertenece al usuario
    const { data: project, error: projectError } = await supabase
      .from("deploy_projects")
      .select("id, name")
      .eq("id", projectId)
      .eq("user_id", session.user.email)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 },
      );
    }

    // Verificar que el ambiente pertenece al proyecto
    const { data: environment, error: envError } = await supabase
      .from("deploy_environments")
      .select("id, name")
      .eq("id", environmentId)
      .eq("project_id", projectId)
      .single();

    if (envError || !environment) {
      return NextResponse.json(
        { error: "Ambiente no encontrado" },
        { status: 404 },
      );
    }

    // Crear nuevo deployment
    const { data: deployment, error } = await supabase
      .from("deploy_deployments")
      .insert({
        project_id: projectId,
        environment_id: environmentId,
        commit_sha: commitSha,
        commit_message: commitMessage,
        branch,
        pull_request_id: pullRequestId,
        status: "pending",
        phase: "init",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating deployment:", error);
      return NextResponse.json(
        { error: "Error al crear deployment" },
        { status: 500 },
      );
    }

    // TODO: Aquí se iniciaría el proceso de deploy real
    // Por ahora solo actualizamos el estado
    setTimeout(async () => {
      await supabase
        .from("deploy_deployments")
        .update({
          status: "building",
          phase: "clone",
        })
        .eq("id", deployment.id);
    }, 1000);

    return NextResponse.json({
      success: true,
      data: deployment,
      message: "Deployment iniciado exitosamente",
    });
  } catch (error) {
    console.error("Error in POST /api/deploy/deployments:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
