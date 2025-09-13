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

    // Obtener estadísticas básicas del usuario
    const { data: projects, error: projectsError } = await supabase
      .from("deploy_projects")
      .select("id, status")
      .eq("user_id", session.user.email);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return NextResponse.json(
        { error: "Error al obtener proyectos" },
        { status: 500 },
      );
    }

    const projectIds = projects?.map((p) => p.id) || [];

    // Obtener estadísticas de deployments
    const { data: deployments, error: deploymentsError } = await supabase
      .from("deploy_deployments")
      .select("id, status, commit_message, branch, created_at")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(5);

    if (deploymentsError) {
      console.error("Error fetching deployments:", deploymentsError);
      return NextResponse.json(
        { error: "Error al obtener deployments" },
        { status: 500 },
      );
    }

    // Calcular estadísticas
    const totalProjects = projects?.length || 0;
    const activeProjects =
      projects?.filter((p) => p.status === "active").length || 0;
    const totalDeploys = deployments?.length || 0;

    // Calcular tasa de éxito
    const successfulDeploys =
      deployments?.filter((d) => d.status === "success").length || 0;
    const failedDeploys =
      deployments?.filter((d) => d.status === "failed").length || 0;
    const avgSuccessRate =
      successfulDeploys + failedDeploys > 0
        ? Math.round(
            (successfulDeploys / (successfulDeploys + failedDeploys)) * 100,
          )
        : 0;

    // Obtener métricas de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthlyMetrics, error: metricsError } = await supabase
      .from("deploy_metrics")
      .select("*")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .in("project_id", projectIds);

    if (metricsError) {
      console.error("Error fetching monthly metrics:", metricsError);
      return NextResponse.json(
        { error: "Error al obtener métricas mensuales" },
        { status: 500 },
      );
    }

    // Calcular métricas agregadas
    const aggregatedMetrics = monthlyMetrics?.reduce(
      (acc, metric) => {
        acc.totalDeploys += metric.total_deploys || 0;
        acc.successfulDeploys += metric.successful_deploys || 0;
        acc.failedDeploys += metric.failed_deploys || 0;
        acc.totalBuildTime += metric.avg_build_time || 0;
        acc.totalDeployTime += metric.avg_deploy_time || 0;
        acc.count++;
        return acc;
      },
      {
        totalDeploys: 0,
        successfulDeploys: 0,
        failedDeploys: 0,
        totalBuildTime: 0,
        totalDeployTime: 0,
        count: 0,
      },
    ) || {
      totalDeploys: 0,
      successfulDeploys: 0,
      failedDeploys: 0,
      totalBuildTime: 0,
      totalDeployTime: 0,
      count: 0,
    };

    const avgBuildTime =
      aggregatedMetrics.count > 0
        ? Math.round(aggregatedMetrics.totalBuildTime / aggregatedMetrics.count)
        : 0;

    const avgDeployTime =
      aggregatedMetrics.count > 0
        ? Math.round(
            aggregatedMetrics.totalDeployTime / aggregatedMetrics.count,
          )
        : 0;

    const successRate =
      aggregatedMetrics.totalDeploys > 0
        ? Math.round(
            (aggregatedMetrics.successfulDeploys /
              aggregatedMetrics.totalDeploys) *
              100,
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        userStats: {
          total_projects: totalProjects,
          active_projects: activeProjects,
          total_deploys: totalDeploys,
          avg_success_rate: avgSuccessRate,
          recent_deploys: deployments || [],
        },
        recentDeployments: deployments || [],
        monthlyMetrics: {
          totalDeploys: aggregatedMetrics.totalDeploys,
          successfulDeploys: aggregatedMetrics.successfulDeploys,
          failedDeploys: aggregatedMetrics.failedDeploys,
          successRate,
          avgBuildTime,
          avgDeployTime,
          period: "30 días",
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/deploy/stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
