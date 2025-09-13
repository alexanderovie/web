import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");

    if (!installationId) {
      return NextResponse.redirect(
        new URL(
          "https://dashboard.fascinantedigital.com?error=no_installation",
          request.url,
        ),
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Guardar la instalación de GitHub
    const { error: installError } = await supabase
      .from("github_installations")
      .upsert(
        {
          user_id: session.user.email,
          installation_id: installationId,
          setup_action: setupAction || "install",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

    if (installError) {
      console.error("Error saving GitHub installation:", installError);
      return NextResponse.redirect(
        new URL(
          "https://dashboard.fascinantedigital.com?error=save_failed",
          request.url,
        ),
      );
    }

    // Obtener repositorios de la instalación
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

      if (githubResponse.ok) {
        const reposData = await githubResponse.json();

        // Guardar repositorios disponibles
        for (const repo of reposData.repositories || []) {
          await supabase.from("github_repositories").upsert(
            {
              user_id: session.user.email,
              installation_id: installationId,
              repository_id: repo.id,
              repository_name: repo.full_name,
              repository_url: repo.html_url,
              private: repo.private,
              default_branch: repo.default_branch,
              created_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,repository_id",
            },
          );
        }
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      // No fallamos si no podemos obtener los repos
    }

    return NextResponse.redirect(
      new URL(
        "https://dashboard.fascinantedigital.com?success=github_connected",
        request.url,
      ),
    );
  } catch (error) {
    console.error("Error in GitHub callback:", error);
    return NextResponse.redirect(
      new URL(
        "https://dashboard.fascinantedigital.com?error=callback_failed",
        request.url,
      ),
    );
  }
}
