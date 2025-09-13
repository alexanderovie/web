import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Construir filtros
    const filters: any = { user_id: session.user.email };
    if (status) filters.status = status;

    // Obtener proyectos con ambientes
    const { data: projects, error } = await supabase
      .from("deploy_projects")
      .select(
        `
        *,
        deploy_environments (
          id,
          name,
          slug,
          status,
          last_deploy_at
        )
      `,
      )
      .eq("user_id", session.user.email)
      .ilike("name", `%${search}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Error al obtener proyectos" },
        { status: 500 },
      );
    }

    // Obtener total de proyectos para paginación
    const { count } = await supabase
      .from("deploy_projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.email)
      .ilike("name", `%${search}%`);

    return NextResponse.json({
      success: true,
      data: projects || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/deploy/projects:", error);
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
    const { name, repository, description } = body;

    if (!name || !repository) {
      return NextResponse.json(
        {
          error: "Nombre y repositorio son requeridos",
        },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Usar función para crear proyecto completo
    const { data: projectId, error } = await supabase.rpc(
      "create_deploy_project",
      {
        p_user_id: session.user.email,
        p_name: name,
        p_repository: repository,
        p_description: description || null,
      },
    );

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Error al crear proyecto" },
        { status: 500 },
      );
    }

    // Obtener el proyecto creado con todos sus datos
    const { data: project, error: fetchError } = await supabase
      .from("deploy_projects")
      .select(
        `
        *,
        deploy_environments (*)
      `,
      )
      .eq("id", projectId)
      .single();

    if (fetchError) {
      console.error("Error fetching created project:", fetchError);
      return NextResponse.json(
        { error: "Error al obtener proyecto creado" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: "Proyecto creado exitosamente",
    });
  } catch (error) {
    console.error("Error in POST /api/deploy/projects:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
