import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { projectId } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Obtener proyecto con métricas y ambientes
    const { data: project, error } = await supabase
      .from("deploy_projects")
      .select(
        `
        *,
        deploy_environments (*),
        deploy_deployments (
          id,
          status,
          phase,
          commit_sha,
          commit_message,
          branch,
          started_at,
          completed_at,
          total_duration
        )
      `,
      )
      .eq("id", projectId)
      .eq("user_id", session.user.email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Proyecto no encontrado" },
          { status: 404 },
        );
      }
      console.error("Error fetching project:", error);
      return NextResponse.json(
        { error: "Error al obtener proyecto" },
        { status: 500 },
      );
    }

    // Obtener métricas del proyecto
    const { data: metrics } = await supabase.rpc("get_project_metrics", {
      p_project_id: projectId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        metrics,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/deploy/projects/[projectId]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const {
      name,
      description,
      status,
      build_config,
      deploy_config,
      environment_vars,
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Verificar que el proyecto pertenece al usuario
    const { data: existingProject, error: checkError } = await supabase
      .from("deploy_projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", session.user.email)
      .single();

    if (checkError || !existingProject) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 },
      );
    }

    // Actualizar proyecto
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (build_config !== undefined) updateData.build_config = build_config;
    if (deploy_config !== undefined) updateData.deploy_config = deploy_config;
    if (environment_vars !== undefined)
      updateData.environment_vars = environment_vars;

    const { data: project, error } = await supabase
      .from("deploy_projects")
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return NextResponse.json(
        { error: "Error al actualizar proyecto" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: "Proyecto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error in PUT /api/deploy/projects/[projectId]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { projectId } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Verificar que el proyecto pertenece al usuario
    const { data: existingProject, error: checkError } = await supabase
      .from("deploy_projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", session.user.email)
      .single();

    if (checkError || !existingProject) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 },
      );
    }

    // Eliminar proyecto (las tablas relacionadas se eliminan en cascada)
    const { error } = await supabase
      .from("deploy_projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      return NextResponse.json(
        { error: "Error al eliminar proyecto" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Proyecto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error in DELETE /api/deploy/projects/[projectId]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
