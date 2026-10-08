export const DEFAULT_SCHEMA_TEXT = `table User {
  id uuid pk
  email varchar unique
  profile_id uuid -> Profile.id
}

table Profile {
  id uuid pk
  display_name varchar required
}

User.profile_id -> Profile.id`;
