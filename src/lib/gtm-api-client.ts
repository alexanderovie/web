/**
 * Google Tag Manager API Client
 * Prueba el alcance de la API key de GTM
 */

export interface GTMAccount {
  accountId: string;
  name: string;
  fingerprint: string;
  path: string;
}

export interface GTMContainer {
  containerId: string;
  name: string;
  publicId: string;
  usageContext: string[];
  fingerprint: string;
  path: string;
}

export interface GTMTag {
  tagId: string;
  name: string;
  type: string;
  tagFiringOption: string;
  parameter: Array<{
    type: string;
    key: string;
    value: string;
  }>;
}

export interface GTMTrigger {
  triggerId: string;
  name: string;
  type: string;
  customEventFilter: Array<{
    type: string;
    parameter: Array<{
      type: string;
      key: string;
      value: string;
    }>;
  }>;
}

export interface GTMVariable {
  variableId: string;
  name: string;
  type: string;
  parameter: Array<{
    type: string;
    key: string;
    value: string;
  }>;
}

class GTMAPIClient {
  private apiKey: string;
  private baseURL = "https://www.googleapis.com/tagmanager/v2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Prueba la conectividad básica con la API
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      const response = await fetch(
        `${this.baseURL}/accounts?key=${this.apiKey}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`,
          data: errorData,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: "Conexión exitosa con GTM API",
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error}`,
        data: error,
      };
    }
  }

  /**
   * Obtiene todas las cuentas de GTM
   */
  async getAccounts(): Promise<{
    success: boolean;
    accounts?: GTMAccount[];
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseURL}/accounts?key=${this.apiKey}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        accounts: data.account || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error}`,
      };
    }
  }

  /**
   * Obtiene los contenedores de una cuenta
   */
  async getContainers(accountId: string): Promise<{
    success: boolean;
    containers?: GTMContainer[];
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.baseURL}/accounts/${accountId}/containers?key=${this.apiKey}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        containers: data.container || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error}`,
      };
    }
  }

  /**
   * Obtiene los tags de un contenedor
   */
  async getTags(
    accountId: string,
    containerId: string,
  ): Promise<{ success: boolean; tags?: GTMTag[]; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/accounts/${accountId}/containers/${containerId}/tags?key=${this.apiKey}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        tags: data.tag || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error}`,
      };
    }
  }

  /**
   * Obtiene los triggers de un contenedor
   */
  async getTriggers(
    accountId: string,
    containerId: string,
  ): Promise<{ success: boolean; triggers?: GTMTrigger[]; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/accounts/${accountId}/containers/${containerId}/triggers?key=${this.apiKey}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        triggers: data.trigger || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error}`,
      };
    }
  }

  /**
   * Obtiene las variables de un contenedor
   */
  async getVariables(
    accountId: string,
    containerId: string,
  ): Promise<{ success: boolean; variables?: GTMVariable[]; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/accounts/${accountId}/containers/${containerId}/variables?key=${this.apiKey}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error ${response.status}: ${errorData.error?.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        variables: data.variable || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error}`,
      };
    }
  }

  /**
   * Prueba completa del alcance de la API
   */
  async testFullScope(): Promise<{
    connection: boolean;
    accounts: GTMAccount[];
    containers: GTMContainer[];
    tags: GTMTag[];
    triggers: GTMTrigger[];
    variables: GTMVariable[];
    summary: {
      totalAccounts: number;
      totalContainers: number;
      totalTags: number;
      totalTriggers: number;
      totalVariables: number;
    };
  }> {
    console.log("🔍 Probando alcance completo de GTM API...");

    // 1. Probar conexión
    const connectionTest = await this.testConnection();
    if (!connectionTest.success) {
      throw new Error(`Error de conexión: ${connectionTest.message}`);
    }

    console.log("✅ Conexión exitosa");

    // 2. Obtener cuentas
    const accountsResult = await this.getAccounts();
    if (!accountsResult.success) {
      throw new Error(`Error obteniendo cuentas: ${accountsResult.error}`);
    }

    const accounts = accountsResult.accounts || [];
    console.log(`📊 Encontradas ${accounts.length} cuentas`);

    // 3. Obtener contenedores de la primera cuenta
    let containers: GTMContainer[] = [];
    let tags: GTMTag[] = [];
    let triggers: GTMTrigger[] = [];
    let variables: GTMVariable[] = [];

    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      console.log(
        `🔍 Explorando cuenta: ${firstAccount.name} (${firstAccount.accountId})`,
      );

      const containersResult = await this.getContainers(firstAccount.accountId);
      if (containersResult.success) {
        containers = containersResult.containers || [];
        console.log(`📦 Encontrados ${containers.length} contenedores`);

        // 4. Obtener tags, triggers y variables del primer contenedor
        if (containers.length > 0) {
          const firstContainer = containers[0];
          console.log(
            `🔍 Explorando contenedor: ${firstContainer.name} (${firstContainer.containerId})`,
          );

          // Tags
          const tagsResult = await this.getTags(
            firstAccount.accountId,
            firstContainer.containerId,
          );
          if (tagsResult.success) {
            tags = tagsResult.tags || [];
            console.log(`🏷️ Encontrados ${tags.length} tags`);
          }

          // Triggers
          const triggersResult = await this.getTriggers(
            firstAccount.accountId,
            firstContainer.containerId,
          );
          if (triggersResult.success) {
            triggers = triggersResult.triggers || [];
            console.log(`🎯 Encontrados ${triggers.length} triggers`);
          }

          // Variables
          const variablesResult = await this.getVariables(
            firstAccount.accountId,
            firstContainer.containerId,
          );
          if (variablesResult.success) {
            variables = variablesResult.variables || [];
            console.log(`📊 Encontradas ${variables.length} variables`);
          }
        }
      }
    }

    const summary = {
      totalAccounts: accounts.length,
      totalContainers: containers.length,
      totalTags: tags.length,
      totalTriggers: triggers.length,
      totalVariables: variables.length,
    };

    console.log("📋 Resumen del alcance:", summary);

    return {
      connection: true,
      accounts,
      containers,
      tags,
      triggers,
      variables,
      summary,
    };
  }
}

export default GTMAPIClient;
