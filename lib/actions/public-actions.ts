"use server";

import { leadFormSchema, testDriveFormSchema, tradeInFormSchema } from "@/lib/validation/forms";
import { isRepositoryUnavailableError } from "@/lib/data/errors";
import { sendNotificationEmail } from "@/lib/resend";
import {
  saveLead,
  saveTestDriveRequest,
  saveTradeInRequest,
} from "@/lib/data/repository";
import { asOptionalNumber, asOptionalString } from "@/lib/utils";
import type { ActionState } from "@/types/dealership";

function validationErrorState(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): ActionState {
  return {
    success: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function buildSubmissionFailureMessage(error: unknown, fallbackMessage: string) {
  if (isRepositoryUnavailableError(error)) {
    return error.message;
  }

  return fallbackMessage;
}

export async function submitLeadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = leadFormSchema.safeParse({
    vehicleId: asOptionalString(formData.get("vehicleId")),
    vehicleTitle: asOptionalString(formData.get("vehicleTitle")),
    leadType: asOptionalString(formData.get("leadType")),
    name: asOptionalString(formData.get("name")),
    phone: asOptionalString(formData.get("phone")),
    email: asOptionalString(formData.get("email")),
    message: asOptionalString(formData.get("message")),
    source: asOptionalString(formData.get("source")),
    utmSource: asOptionalString(formData.get("utmSource")),
    utmMedium: asOptionalString(formData.get("utmMedium")),
    utmCampaign: asOptionalString(formData.get("utmCampaign")),
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    await saveLead(parsed.data);
    await sendNotificationEmail({
      subject: `${parsed.data.leadType.toUpperCase()} enquiry received`,
      lines: [
        `Lead type: ${parsed.data.leadType}`,
        `Name: ${parsed.data.name}`,
        `Phone: ${parsed.data.phone}`,
        `Email: ${parsed.data.email || "Not provided"}`,
        `Vehicle: ${parsed.data.vehicleTitle || "General enquiry"}`,
        `Source: ${parsed.data.source || "Website"}`,
        `Message: ${parsed.data.message || "No message"}`,
      ],
    });

    return {
      success: true,
      message: "Thanks. The sales team will reach out shortly.",
    };
  } catch (error) {
    return {
      success: false,
      message: buildSubmissionFailureMessage(
        error,
        "We could not save your enquiry right now. Please try again.",
      ),
    };
  }
}

export async function submitTestDriveAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = testDriveFormSchema.safeParse({
    vehicleId: asOptionalString(formData.get("vehicleId")),
    vehicleTitle: asOptionalString(formData.get("vehicleTitle")),
    name: asOptionalString(formData.get("name")),
    phone: asOptionalString(formData.get("phone")),
    email: asOptionalString(formData.get("email")),
    preferredDate: asOptionalString(formData.get("preferredDate")),
    preferredTime: asOptionalString(formData.get("preferredTime")),
    message: asOptionalString(formData.get("message")),
    source: asOptionalString(formData.get("source")),
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    await saveTestDriveRequest(parsed.data);
    await sendNotificationEmail({
      subject: "Test drive or viewing request received",
      lines: [
        `Name: ${parsed.data.name}`,
        `Phone: ${parsed.data.phone}`,
        `Email: ${parsed.data.email || "Not provided"}`,
        `Vehicle: ${parsed.data.vehicleTitle || "General request"}`,
        `Preferred date: ${parsed.data.preferredDate || "Not provided"}`,
        `Preferred time: ${parsed.data.preferredTime || "Not provided"}`,
        `Message: ${parsed.data.message || "No message"}`,
      ],
    });

    return {
      success: true,
      message: "Your viewing request is in. We will confirm the slot shortly.",
    };
  } catch (error) {
    return {
      success: false,
      message: buildSubmissionFailureMessage(
        error,
        "We could not save the request right now. Please try again.",
      ),
    };
  }
}

export async function submitTradeInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = tradeInFormSchema.safeParse({
    desiredVehicleId: asOptionalString(formData.get("desiredVehicleId")),
    desiredVehicleTitle: asOptionalString(formData.get("desiredVehicleTitle")),
    name: asOptionalString(formData.get("name")),
    phone: asOptionalString(formData.get("phone")),
    email: asOptionalString(formData.get("email")),
    currentVehicleMake: asOptionalString(formData.get("currentVehicleMake")),
    currentVehicleModel: asOptionalString(formData.get("currentVehicleModel")),
    currentVehicleYear: asOptionalNumber(formData.get("currentVehicleYear")),
    currentVehicleMileage: asOptionalNumber(formData.get("currentVehicleMileage")),
    conditionNotes: asOptionalString(formData.get("conditionNotes")),
    message: asOptionalString(formData.get("message")),
    source: asOptionalString(formData.get("source")),
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    await saveTradeInRequest(parsed.data);
    await sendNotificationEmail({
      subject: "Trade-in enquiry received",
      lines: [
        `Name: ${parsed.data.name}`,
        `Phone: ${parsed.data.phone}`,
        `Email: ${parsed.data.email || "Not provided"}`,
        `Desired vehicle: ${parsed.data.desiredVehicleTitle || "Not specified"}`,
        `Current vehicle: ${parsed.data.currentVehicleYear} ${parsed.data.currentVehicleMake} ${parsed.data.currentVehicleModel}`,
        `Mileage: ${parsed.data.currentVehicleMileage || "Not provided"}`,
        `Condition notes: ${parsed.data.conditionNotes || "Not provided"}`,
        `Message: ${parsed.data.message || "No message"}`,
      ],
    });

    return {
      success: true,
      message: "Thanks. We will review your trade-in details and follow up.",
    };
  } catch (error) {
    return {
      success: false,
      message: buildSubmissionFailureMessage(
        error,
        "We could not save the trade-in request right now.",
      ),
    };
  }
}
