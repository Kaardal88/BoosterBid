export function validateRegisterForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email.";
  } else if (!/@(noroff\.no|stud\.noroff\.no)$/i.test(data.email.trim())) {
    errors.email =
      "Please provide a noroff.no or a stud.noroff.no email address.";
  }

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (data.avatarUrl && !/^https?:\/\/\S+\.\S+/.test(data.avatarUrl)) {
    errors.avatarUrl = "Avatar URL must be a valid URL (http/https).";
  }

  return errors;
}
