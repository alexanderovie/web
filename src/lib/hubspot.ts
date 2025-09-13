import { Client } from "@hubspot/api-client";
import type {
  PublicObjectSearchRequest,
  FilterOperatorEnum,
} from "@hubspot/api-client/lib/codegen/crm/contacts";

// 🚀 HubSpot Client Configuration
const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN,
  numberOfApiCallRetries: 3, // Retry failed requests up to 3 times
});

// 📋 Types for better type safety
interface HubSpotContact {
  id?: string;
  properties: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    last_message?: string;
    source?: string;
    [key: string]: any;
  };
}

// interface UpsertContactParams {
//   phone: string;
//   message: string;
// }

// 🔍 Search for existing contact by phone number
async function findContactByPhone(phone: string): Promise<string | null> {
  try {
    // Production: Finding contact by phone

    const searchRequest: PublicObjectSearchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "phone",
              operator: "EQ" as FilterOperatorEnum,
              value: phone,
            },
          ],
        },
      ],
      properties: ["phone", "firstname", "lastname"],
      limit: 1,
      after: "0",
    };

    const response =
      await hubspotClient.crm.contacts.searchApi.doSearch(searchRequest);

    if (response.results && response.results.length > 0) {
      const contactId = response.results[0].id;
      // Production: Contact found
      return contactId;
    }

    // Production: Contact not found
    return null;
  } catch (error) {
    console.error("❌ Error buscando contacto en HubSpot:", error);
    throw new Error(
      `Error buscando contacto: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// 📝 Update existing contact with new message
async function updateContact(
  contactId: string,
  source: string = "WhatsApp",
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("📝 Actualizando contacto en HubSpot:", contactId);

    const updateRequest: HubSpotContact = {
      properties: {
        // last_message: message, // Comentado hasta crear la propiedad
        // Por ahora actualizamos el nombre para indicar que fue actualizado
        firstname: `${source} (Updated)`,
      },
    };

    await hubspotClient.crm.contacts.basicApi.update(contactId, updateRequest);
    console.log("✅ Contacto actualizado exitosamente");
    return { success: true };
  } catch (error) {
    console.error("❌ Error actualizando contacto en HubSpot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ➕ Create new contact
async function createContact(
  phone: string,
  source: string = "WhatsApp",
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    console.log("📝 Creando nuevo contacto en HubSpot:", phone);

    const contactData = {
      properties: {
        phone,
        firstname: source,
        lastname: "Lead",
        // last_message: message, // Comentado hasta crear la propiedad en HubSpot
        // source: source, // Comentado hasta crear la propiedad en HubSpot
      },
    };

    const response =
      await hubspotClient.crm.contacts.basicApi.create(contactData);
    console.log("✅ Contacto creado exitosamente:", response.id);

    return { success: true, contactId: response.id };
  } catch (error: any) {
    console.error("❌ Error creando contacto:", error);
    return { success: false, error: error.message };
  }
}

// 📧 Función para enviar notificación personalizada
async function sendWhatsAppNotification(
  contactId: string,
  phone: string,
  message: string,
  action: "created" | "updated",
) {
  try {
    console.log("📧 Enviando notificación personalizada para WhatsApp...");

    // Actualizar el contacto con información del mensaje en una propiedad existente
    const updateData = {
      properties: {
        // Usar una propiedad que existe, como 'description' o 'notes'
        // Si no tienes 'description', podemos usar 'firstname' para indicar que fue actualizado
        firstname:
          action === "created" ? "WhatsApp Lead" : "WhatsApp Lead (Updated)",
      },
    };

    // Actualizar el contacto con la información del mensaje
    await hubspotClient.crm.contacts.basicApi.update(contactId, updateData);
    console.log("✅ Contacto actualizado con información de WhatsApp");

    // 🎯 ASIGNAR CONTACTO A ALEXANDER
    if (action === "created") {
      try {
        console.log("👤 Asignando contacto a alexanderovie@gmail.com...");

        // Buscar el usuario por email
        const userSearchResponse =
          await hubspotClient.crm.owners.ownersApi.getPage();
        const alexanderUser = userSearchResponse.results?.find(
          (user: any) => user.email === "alexanderovie@gmail.com",
        );

        if (alexanderUser) {
          // Asignar el contacto al usuario
          const assignmentData = {
            properties: {
              hubspot_owner_id: alexanderUser.id,
            },
          };

          await hubspotClient.crm.contacts.basicApi.update(
            contactId,
            assignmentData,
          );
          console.log("✅ Contacto asignado a alexanderovie@gmail.com");
        } else {
          console.log(
            "⚠️ Usuario alexanderovie@gmail.com no encontrado en HubSpot",
          );
        }
      } catch (assignmentError) {
        console.error("❌ Error asignando contacto:", assignmentError);
      }
    }

    // También puedes enviar un email de notificación aquí si lo configuras
    // await sendEmailNotification(contactId, phone, message, action);
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
    // No fallamos el proceso principal por errores de notificación
  }
}

// 🎯 Main function: Upsert contact with phone and message
export async function upsertHubspotContact({
  phone,
  message,
  source = "WhatsApp",
}: {
  phone: string;
  message: string;
  source?: string;
}): Promise<{
  success: boolean;
  action: "created" | "updated" | "update_failed" | "create_failed";
  contactId?: string;
  error?: string;
}> {
  try {
    // Validate input parameters
    if (!phone || !message) {
      throw new Error("Phone and message are required");
    }

    if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
      throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
    }

    console.log("🚀 Iniciando upsert de contacto en HubSpot:", {
      phone,
      messageLength: message.length,
    });

    // Step 1: Search for existing contact
    const existingContactId = await findContactByPhone(phone);

    if (existingContactId) {
      // Step 2: Update existing contact
      const updateResult = await updateContact(existingContactId, source);

      if (updateResult.success) {
        // Send notification for update
        await sendWhatsAppNotification(
          existingContactId,
          phone,
          message,
          "updated",
        );
        console.log("✅ Contacto updated en HubSpot:", existingContactId);
        return {
          success: true,
          action: "updated",
          contactId: existingContactId,
        };
      } else {
        console.error("❌ Error actualizando contacto:", updateResult.error);
        return {
          success: false,
          action: "update_failed",
          error: updateResult.error,
        };
      }
    } else {
      // Step 3: Create new contact
      const createResult = await createContact(phone, source);

      if (createResult.success && createResult.contactId) {
        // Send notification for new contact
        await sendWhatsAppNotification(
          createResult.contactId,
          phone,
          message,
          "created",
        );
        console.log("✅ Contacto created en HubSpot:", createResult.contactId);
        return {
          success: true,
          action: "created",
          contactId: createResult.contactId,
        };
      } else {
        console.error("❌ Error creando contacto:", createResult.error);
        return {
          success: false,
          action: "create_failed",
          error: createResult.error,
        };
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error en upsertHubspotContact:", errorMessage);

    return {
      success: false,
      error: errorMessage,
      action: "created", // fallback
    };
  }
}

// 🔧 Utility function to test HubSpot connection
export async function testHubSpotConnection(): Promise<boolean> {
  try {
    console.log("🧪 Probando conexión con HubSpot...");

    // Try to get a single contact to test the connection
    await hubspotClient.crm.contacts.basicApi.getPage(1);

    console.log("✅ Conexión con HubSpot exitosa");
    return true;
  } catch (error) {
    console.error("❌ Error conectando con HubSpot:", error);
    return false;
  }
}

// 🎯 Función para cambiar la etapa del ciclo de vida
export async function updateContactLifecycleStage(
  contactId: string,
  stage: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(
      `🔄 Cambiando etapa del ciclo de vida para contacto ${contactId} a: ${stage}`,
    );

    const updateData = {
      properties: {
        lifecyclestage: stage,
      },
    };

    await hubspotClient.crm.contacts.basicApi.update(contactId, updateData);
    console.log(`✅ Etapa del ciclo de vida actualizada a: ${stage}`);

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      "❌ Error actualizando etapa del ciclo de vida:",
      errorMessage,
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// 📊 Función para obtener las etapas disponibles del ciclo de vida
export async function getLifecycleStages(): Promise<{
  success: boolean;
  stages?: string[];
  error?: string;
}> {
  try {
    console.log("📋 Obteniendo etapas del ciclo de vida disponibles...");

    // Las etapas válidas en tu cuenta de HubSpot
    const standardStages = [
      "subscriber", // Suscriptor
      "lead", // Lead
      "marketingqualifiedlead", // Lead calificado para marketing
      "salesqualifiedlead", // Lead calificado para ventas
      "opportunity", // Oportunidad
      "customer", // Cliente
      "evangelist", // Evangelista
      "other", // Otro
    ];

    console.log("✅ Etapas del ciclo de vida obtenidas");

    return {
      success: true,
      stages: standardStages,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      "❌ Error obteniendo etapas del ciclo de vida:",
      errorMessage,
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// 🗑️ Función para eliminar un contacto de HubSpot
export async function deleteContact(contactId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`🗑️ Eliminando contacto de HubSpot: ${contactId}`);

    await hubspotClient.crm.contacts.basicApi.archive(contactId);
    console.log(`✅ Contacto eliminado exitosamente: ${contactId}`);

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error eliminando contacto:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// 📊 Get contact statistics (for monitoring)
export async function getContactStats(): Promise<{
  totalContacts: number;
  lastCreated?: string;
}> {
  try {
    const response = await hubspotClient.crm.contacts.basicApi.getPage(1);

    return {
      totalContacts: response.results?.length || 0,
      lastCreated: response.results?.[0]?.createdAt?.toISOString(),
    };
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de contactos:", error);
    throw error;
  }
}
