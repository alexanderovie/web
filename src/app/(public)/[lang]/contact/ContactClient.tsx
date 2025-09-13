"use client";

import { Mail, Phone } from "lucide-react";

import Contact from "@/components/sections/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ContactClientProps = {
  headerIcon: string;
  headerIconTitle: string;
  headerTitle: string;
  headerDescription: string;
  formFields: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    props?: Record<string, unknown>;
  }>;
  contactMethods: Array<{
    icon: string;
    title: string;
    description: string;
    href: string;
  }>;
  submitText: string;
  toastLoading?: string;
  toastSuccess?: string;
  toastError?: string;
};

const iconMap = {
  mail: Mail,
  phone: Phone,
};

export default function ContactClient(props: ContactClientProps) {
  // Mapear los componentes Input/Textarea según el tipo
  const formFields = props.formFields.map((field) => ({
    ...field,
    component: field.type === "textarea" ? Textarea : Input,
  }));
  const contactMethods = props.contactMethods.map((method) => ({
    ...method,
    icon: iconMap[method.icon as keyof typeof iconMap] || Mail,
  }));
  const headerIcon = iconMap[props.headerIcon as keyof typeof iconMap] || Mail;
  return (
    <Contact
      headerIcon={headerIcon}
      headerIconTitle={props.headerIconTitle}
      headerTitle={props.headerTitle}
      headerDescription={props.headerDescription}
      formFields={formFields}
      contactMethods={contactMethods}
      submitText={props.submitText}
      toastLoading={props.toastLoading}
      toastSuccess={props.toastSuccess}
      toastError={props.toastError}
      asPage={true}
    />
  );
}
