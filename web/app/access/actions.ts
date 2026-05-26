"use server";

export type AccessFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialAccessFormState: AccessFormState = {
  status: "idle",
  message: "Priority access is currently open for design partners and technical evaluation teams.",
};

export async function requestAccess(
  _previousState: AccessFormState,
  formData: FormData
): Promise<AccessFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const currentTools = String(formData.get("currentTools") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !company || !interest) {
    return {
      status: "error",
      message: "Incomplete state. Add your name, work email, company, and interest area.",
    };
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    return {
      status: "error",
      message: "Invalid email state. Check the address and submit again.",
    };
  }

  const payload = {
    name,
    email,
    company,
    interest,
    currentTools,
    message,
    submittedAt: new Date().toISOString(),
  };

  if (process.env.RESEND_API_KEY && process.env.QTANGL_ACCESS_TO_EMAIL) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.QTANGL_FROM_EMAIL ?? "Qtangl Access <access@qtangl.com>",
        to: [process.env.QTANGL_ACCESS_TO_EMAIL],
        subject: `Qtangl access request — ${company}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company}`,
          `Interest: ${interest}`,
          `Current tools: ${currentTools || "not provided"}`,
          "",
          message ? `Message:\n${message}` : "Message: none provided",
        ].join("\n"),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "error",
        message: "Delivery failure. The request was valid, but email routing did not complete.",
      };
    }

    return {
      status: "success",
      message: "Signal received. Qtangl will reach out when the next pilot window opens.",
    };
  }

  if (process.env.FORMSPREE_ENDPOINT) {
    const response = await fetch(process.env.FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: "error",
        message: "Delivery failure. The request reached the server action but not the form endpoint.",
      };
    }

    return {
      status: "success",
      message: "Signal received. Qtangl will reach out when the next pilot window opens.",
    };
  }

  console.info("Qtangl access request (delivery not configured)", payload);

  return {
    status: "success",
    message:
      "Signal received. Email delivery is not configured yet, but the server action path is active.",
  };
}
