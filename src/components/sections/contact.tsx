import React from "react";

import Link from "next/link";

import { Mail, Phone, Building, ChevronRight, LucideIcon } from "lucide-react";

import SectionHeader from "../section-header";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description:
      "Have a question or need help? Drop us an email, and we'll respond within 24 hours.",
    contact: "hello@relative.io",
  },
  {
    icon: Phone,
    title: "Phone",
    description:
      "Prefer to chat? Give us a call Monday–Friday, 9 AM–5 PM (PST).",
    contact: "+1 (123) 456-7890",
  },
  {
    icon: Building,
    title: "Office",
    description:
      "Stop by our office @ 123 Productivity Ave, San Francisco, CA 94105",
    contact: (
      <Link
        href="#"
        className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        Get Directions
        <ChevronRight className="size-4" />
      </Link>
    ),
  },
];

const formFields = [
  {
    id: "name",
    label: "Name",
    type: "text",
    component: Input,
    required: true,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    component: Input,
    required: true,
  },
  {
    id: "message",
    label: "Message",
    component: Textarea,
    required: true,

    props: {
      placeholder: "Type Your Message...",
      rows: 4,
    },
  },
];
const Contact = () => {
  return (
    <section className="py-14 md:py-20 lg:py-24">
      <SectionHeader
        icon={Mail}
        iconTitle="Reach Out"
        title="Get in Touch"
        description="We're here to help—reach out with any questions or feedback."
        className="border-none !pb-0"
      />

      <div className="container flex justify-between gap-10 py-12 max-md:flex-col">
        <form className="flex flex-1 flex-col gap-6">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-normal" htmlFor={field.id}>
                {field.label}
              </Label>
              <field.component
                id={field.id}
                type={field.type}
                required={field.required}
                className="border-border bg-card"
                {...field.props}
              />
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" required />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the{" "}
                <Link href="/terms" className="underline">
                  Terms
                </Link>
              </Label>
            </div>
          </div>

          <Button type="submit">Submit</Button>
        </form>

        <div className="grid flex-1 gap-6 self-start lg:grid-cols-2">
          {contactMethods.map((method, index) => (
            <ContactMethod key={index} {...method} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ContactMethodProps {
  icon: LucideIcon;
  title: string;
  description: string;
  contact: React.ReactNode;
}

const ContactMethod = ({
  icon: Icon,
  title,
  description,
  contact,
}: ContactMethodProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon className="size-5" />
      <h3 className="text-2xl tracking-[-0.96px]">{title}</h3>
    </div>
    <div className="space-y-2 tracking-[-0.32px]">
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="text-muted-foreground text-sm">{contact}</div>
    </div>
  </div>
);

export default Contact;
