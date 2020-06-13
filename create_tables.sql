CREATE TABLE courses (
  id                VARCHAR(255) PRIMARY KEY,
  description       TEXT,
  class_id          VARCHAR(255),
  url               VARCHAR(255),
  pretty_url        VARCHAR(255),
  name              VARCHAR(255),
  term_id           VARCHAR(255),
  host              VARCHAR(255),
  subject           VARCHAR(255),
  class_attributes  VARCHAR(255)[],
  nupath            VARCHAR(255)[],
  max_credits       INTEGER,
  min_credits       INTEGER,
  fee_amount        INTEGER,
  fee_description   VARCHAR(255),
  prereqs           JSONB,
  coreqs            JSONB,
  prereqs_for       JSONB,
  opt_prereqs_for   JSONB,
  last_update_time  TIMESTAMPTZ
);

CREATE INDEX unique_course_props ON courses (class_id, term_id, subject);

CREATE TABLE sections (
  id              VARCHAR(255) PRIMARY KEY,
  seats_capacity  INTEGER,
  seats_remaining INTEGER,
  wait_capacity   INTEGER,
  wait_remaining  INTEGER,
  online          BOOLEAN,
  honors          BOOLEAN,
  url             VARCHAR(255),
  crn             VARCHAR(255),
  meetings        JSONB,
  class_hash      VARCHAR(255) REFERENCES courses (id),
  info            TEXT,
  profs           VARCHAR(255)[],
  class_type      VARCHAR(255)
);

CREATE TABLE users (
  id               VARCHAR(255) PRIMARY KEY,
  facebook_page_id VARCHAR(255),
  first_name       VARCHAR(255),
  last_name        VARCHAR(255),
  login_keys       VARCHAR(255)[]
);

CREATE TABLE followed_courses (
  user_id   VARCHAR(255) REFERENCES users (id),
  course_id VARCHAR(255) REFERENCES courses (id),
  PRIMARY KEY(user_id, course_id)
);

CREATE TABLE followed_sections (
  user_id VARCHAR(255) REFERENCES users (id),
  section_id VARCHAR(255) REFERENCES sections (id),
  PRIMARY KEY(user_id, section_id)
);

CREATE TABLE majors (
  id             SERIAL PRIMARY KEY,
  major_id       VARCHAR(255),
  catalog_year   INTEGER,
  name           VARCHAR(255),
  requirements   JSONB,
  plans_of_study JSONB
);
