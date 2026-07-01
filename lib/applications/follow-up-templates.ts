import type { FollowUpKind } from "@/lib/applications/follow-up-types";

type TemplateInput = {
  role: string;
  company: string;
  contactName?: string;
};

function greeting(input: TemplateInput): string {
  if (input.contactName?.trim()) return `Hi ${input.contactName.trim()},`;
  return "Hi,";
}

function roleCompany(input: TemplateInput): string {
  const role = input.role.trim() || "the role";
  const company = input.company.trim();
  return company ? `${role} at ${company}` : role;
}

export function followUpEmailTemplate(
  kind: FollowUpKind,
  input: TemplateInput
): string | undefined {
  const target = roleCompany(input);
  const g = greeting(input);

  switch (kind) {
    case "apply_followup_1":
      return (
        `${g}\n\n` +
        `I applied for ${target} last week and wanted to reiterate my interest. ` +
        `I'd welcome the chance to speak about how my background fits what you're looking for.\n\n` +
        `Happy to share anything else that would be helpful on your end.\n\n` +
        `Best regards`
      );
    case "apply_followup_2":
      return (
        `${g}\n\n` +
        `Following up on my application for ${target}. I'm still very interested and ` +
        `would appreciate any update on timing or next steps when you have a moment.\n\n` +
        `Thank you for considering my application.\n\n` +
        `Best regards`
      );
    case "apply_followup_3":
      return (
        `${g}\n\n` +
        `I wanted to check in one last time regarding ${target}. I remain interested ` +
        `if the role is still open — and I'd be glad to connect whenever works for your team.\n\n` +
        `Thanks again for your time.\n\n` +
        `Best regards`
      );
    case "interview_thank_you":
      return (
        `${g}\n\n` +
        `Thank you for taking the time to speak with me about ${target}. ` +
        `I enjoyed learning more about the team and the role — especially our conversation about [specific topic from the interview].\n\n` +
        `Our discussion reinforced my interest. Please let me know if I can provide anything else as you move forward.\n\n` +
        `Best regards`
      );
    case "interview_followup_1":
      return (
        `${g}\n\n` +
        `I hope you're doing well. I wanted to follow up after our conversation about ${target} ` +
        `and express my continued interest in the opportunity.\n\n` +
        `Please let me know if there's any additional information I can provide.\n\n` +
        `Best regards`
      );
    case "interview_followup_2":
      return (
        `${g}\n\n` +
        `Checking in regarding ${target}. I remain enthusiastic about the opportunity ` +
        `and wanted to see whether you had an update on next steps.\n\n` +
        `Thank you again for your time.\n\n` +
        `Best regards`
      );
    case "interview_closure":
      return (
        `${g}\n\n` +
        `I understand hiring timelines can shift — I wanted to thank you again for considering me for ${target}. ` +
        `If anything opens up in the future, I'd love to stay in touch.\n\n` +
        `Best regards`
      );
    default:
      return undefined;
  }
}
