import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installation_id");

    if (!installationId) {
      return NextResponse.json(
        { error: "installation_id requerido" },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Verificar que la instalación pertenece al usuario
    const { data: installation, error: installError } = await supabase
      .from("github_installations")
      .select("*")
      .eq("user_id", session.user.email)
      .eq("installation_id", installationId)
      .single();

    if (installError || !installation) {
      return NextResponse.json(
        { error: "Instalación no encontrada" },
        { status: 404 },
      );
    }

    // Obtener repositorios de GitHub
    try {
      const githubResponse = await fetch(
        `https://api.github.com/user/installations/${installationId}/repositories`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_APP_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!githubResponse.ok) {
        throw new Error(`GitHub API error: ${githubResponse.status}`);
      }

      const githubData = await githubResponse.json();
      const repositories = githubData.repositories || [];

      // Verificar cuáles ya están conectados
      const { data: connectedProjects } = await supabase
        .from("deploy_projects")
        .select("repository")
        .eq("user_id", session.user.email);

      const connectedRepos = connectedProjects?.map((p) => p.repository) || [];

      const reposWithStatus = repositories.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        default_branch: repo.default_branch,
        is_connected: connectedRepos.includes(repo.full_name),
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      }));

      return NextResponse.json({
        success: true,
        data: reposWithStatus,
        installation: {
          id: installationId,
          account: installation.account_name,
        },
      });
    } catch (githubError) {
      console.error("Error fetching GitHub repositories:", githubError);
      return NextResponse.json(
        {
          error: "Error al obtener repositorios de GitHub",
          details:
            githubError instanceof Error
              ? githubError.message
              : "Error desconocido",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in GET /api/deploy/github/repositories:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
