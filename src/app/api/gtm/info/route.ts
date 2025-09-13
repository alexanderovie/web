import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No hay token de acceso disponible" },
        { status: 400 },
      );
    }

    // Obtener cuentas de GTM
    const accountsResponse = await fetch(
      "https://www.googleapis.com/tagmanager/v2/accounts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!accountsResponse.ok) {
      return NextResponse.json(
        { error: "Error al obtener cuentas de GTM" },
        { status: accountsResponse.status },
      );
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.account || [];

    // Obtener información detallada de cada cuenta
    const detailedInfo = [];

    for (const account of accounts) {
      const accountId = account.accountId;

      // Obtener contenedores
      const containersResponse = await fetch(
        `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (containersResponse.ok) {
        const containersData = await containersResponse.json();
        const containers = containersData.container || [];

        // Obtener información de cada contenedor
        const containerDetails = [];

        for (const container of containers) {
          const containerId = container.containerId;

          // Obtener tags
          const tagsResponse = await fetch(
            `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/tags`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          // Obtener triggers
          const triggersResponse = await fetch(
            `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/triggers`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          // Obtener variables
          const variablesResponse = await fetch(
            `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/variables`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          const containerInfo = {
            containerId: container.containerId,
            name: container.name,
            publicId: container.publicId,
            usageContext: container.usageContext,
            tags: tagsResponse.ok ? (await tagsResponse.json()).tag || [] : [],
            triggers: triggersResponse.ok
              ? (await triggersResponse.json()).trigger || []
              : [],
            variables: variablesResponse.ok
              ? (await variablesResponse.json()).variable || []
              : [],
          };

          containerDetails.push(containerInfo);
        }

        detailedInfo.push({
          accountId: account.accountId,
          name: account.name,
          containers: containerDetails,
        });
      }
    }

    return NextResponse.json({
      success: true,
      accounts: detailedInfo,
      summary: {
        totalAccounts: accounts.length,
        totalContainers: detailedInfo.reduce(
          (sum, account) => sum + account.containers.length,
          0,
        ),
        totalTags: detailedInfo.reduce(
          (sum, account) =>
            sum +
            account.containers.reduce(
              (cSum, container) => cSum + container.tags.length,
              0,
            ),
          0,
        ),
        totalTriggers: detailedInfo.reduce(
          (sum, account) =>
            sum +
            account.containers.reduce(
              (cSum, container) => cSum + container.triggers.length,
              0,
            ),
          0,
        ),
        totalVariables: detailedInfo.reduce(
          (sum, account) =>
            sum +
            account.containers.reduce(
              (cSum, container) => cSum + container.variables.length,
              0,
            ),
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Error obteniendo información de GTM:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
