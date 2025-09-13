"use client";

import React, { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ContactMethodProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  component: React.ElementType;
  required: boolean;
  props?: Record<string, unknown>;
}

export interface ContactProps {
  headerIcon?: React.ElementType;
  headerIconTitle?: string;
  headerTitle?: string;
  headerDescription?: string;
  formFields?: FormField[];
  contactMethods?: ContactMethodProps[];
  submitText?: string;
  toastLoading?: string;
  toastSuccess?: string;
  toastError?: string;
  asPage?: boolean;
}

const defaultFormFields: FormField[] = [
  {
    id: "fullName",
    label: "Full name",
    type: "text",
    component: Input,
    required: true,
    props: { placeholder: "First and last name" },
  },
  {
    id: "email",
    label: "Work email address",
    type: "email",
    component: Input,
    required: true,
    props: { placeholder: "me@company.com" },
  },
  {
    id: "company",
    label: "Company name",
    type: "text",
    component: Input,
    required: false,
    props: { placeholder: "Company name" },
  },
  {
    id: "employees",
    label: "Number of employees",
    type: "text",
    component: Input,
    required: false,
    props: { placeholder: "Number of employees" },
  },
  {
    id: "message",
    label: "Your message",
    type: "textarea",
    component: Textarea,
    required: true,
    props: { placeholder: "Write your message" },
  },
];

const defaultContactMethods: ContactMethodProps[] = [];

const Contact = ({
  headerIcon,
  headerIconTitle,
  headerTitle = "Contact us",
  headerDescription = "Hopefully this form gets through our spam filters.",
  formFields = defaultFormFields,
  contactMethods = defaultContactMethods,
  submitText = "Submit",
  toastLoading = "Sending message...",
  toastSuccess = "Message sent! We'll get back to you soon.",
  toastError = "There was a problem. Please try again.",
  asPage = false,
}: ContactProps) => {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formFields.forEach((field) => {
      data[field.id] = formData.get(field.id) as string;
    });
    await toast.promise(
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (res) => {
        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || toastError);
        }
        form.reset();
      }),
      {
        loading: toastLoading,
        success: toastSuccess,
        error: (err) => err.message || toastError,
      },
    );
    setLoading(false);
  }

  return (
    <section className="py-32">
      <div className="container max-w-2xl bg-blue-100 p-4">
        <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl bg-green-100 p-2">
          {headerTitle}
        </h1>
        <p className="mt-4 text-center text-muted-foreground bg-yellow-100 p-2">
          {headerDescription}
        </p>

        <div className="mt-8 md:mt-12 bg-purple-100 p-4">
          {/* Inquiry Form */}
          <div className="w-full bg-pink-100 p-4">
            <h2 className="text-lg font-semibold text-center mb-8 bg-orange-100 p-2">
              Inquiries
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5 bg-teal-100 p-4">
              {formFields.map((field) => {
                const Component = field.component;
                return (
                  <div
                    key={field.id}
                    className="space-y-2 bg-indigo-100 p-3 rounded"
                  >
                    <Label className="bg-lime-100 p-1 rounded">
                      {field.label}
                      {!field.required && (
                        <span className="text-muted-foreground/60">
                          {" "}
                          (optional)
                        </span>
                      )}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        name={field.id}
                        placeholder={field.props?.placeholder as string}
                        className="min-h-[120px] resize-none bg-amber-100"
                        required={field.required}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        name={field.id}
                        placeholder={field.props?.placeholder as string}
                        className="bg-amber-100"
                        required={field.required}
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex justify-center bg-cyan-100 p-3 rounded">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {loading ? "Sending..." : submitText}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
