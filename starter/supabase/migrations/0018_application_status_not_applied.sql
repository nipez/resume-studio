-- Status for roles you researched / tailored but chose not to submit
alter type application_status add value if not exists 'not_applied';
