export const SCIENCE_DOMAIN_SCHEMA_TEXT = `table science_almanacs {
  id BIGINT pk
  title VARCHAR(255) required
  subtitle VARCHAR(255)
  description TEXT
  primary_language_id BIGINT -> languages.id
  publisher VARCHAR(255)
  website_url VARCHAR(500)
  source_uri TEXT
  license VARCHAR(255)
  metadata JSON
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table literature_sources {
  id BIGINT pk
  raw_citation TEXT unique required
  parse_status ENUM('raw','parsed','reviewed','found','not_found','downloaded') required
  authors_text TEXT
  authors JSON
  title TEXT required
  publication_year INT
  publication_type ENUM('book','article','conference','thesis','report','review','preprint','patent','other')
  journal_or_book_title VARCHAR(500)
  publisher VARCHAR(255)
  city VARCHAR(255)
  volume VARCHAR(100)
  issue VARCHAR(100)
  pages VARCHAR(100)
  doi VARCHAR(255)
  isbn VARCHAR(50)
  article_number VARCHAR(100)
  read_url TEXT
  download_url TEXT
  disk_path TEXT
  file_format VARCHAR(50)
  file_checksum VARCHAR(128)
  search_query TEXT
  search_status ENUM('pending','searched','found','not_found','ambiguous','error')
  search_checked_at TIMESTAMP
  notes TEXT
  source_metadata JSON
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_almanac_issues {
  id BIGINT pk
  almanac_id BIGINT required -> science_almanacs.id
  title VARCHAR(255) required
  issue_number VARCHAR(100)
  volume VARCHAR(100)
  year INT
  publication_date DATE
  source_uri TEXT
  cover_image_url VARCHAR(500)
  metadata JSON
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_source_documents {
  id BIGINT pk
  almanac_id BIGINT required -> science_almanacs.id
  issue_id BIGINT -> science_almanac_issues.id
  rag_document_id BIGINT -> rag_document.id
  source_type ENUM('file','url','text','html','pdf','docx','markdown','json','other') required
  source_uri TEXT required
  checksum VARCHAR(128)
  mime_type VARCHAR(255)
  language_id BIGINT -> languages.id
  title VARCHAR(500)
  raw_text TEXT
  parse_status ENUM('pending','parsed','partially_parsed','failed') required
  parse_errors JSON
  metadata JSON
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_almanac_sections {
  id BIGINT pk
  issue_id BIGINT required -> science_almanac_issues.id
  parent_section_id BIGINT -> science_almanac_sections.id
  title VARCHAR(255) required
  section_type ENUM('part','chapter','section','subsection','rubric','appendix','bibliography','index','other') required
  order_number INT required
  page_start INT
  page_end INT
  anchor VARCHAR(255)
  metadata JSON
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_almanac_articles {
  id BIGINT pk
  issue_id BIGINT required -> science_almanac_issues.id
  section_id BIGINT -> science_almanac_sections.id
  source_document_id BIGINT -> science_source_documents.id
  title VARCHAR(500) required
  subtitle VARCHAR(500)
  abstract TEXT
  body TEXT
  article_type ENUM('article','review','editorial','interview','case_study','protocol','news','bibliography','glossary_entry','advertisement','other') required
  page_start INT
  page_end INT
  doi VARCHAR(255)
  url VARCHAR(500)
  language_id BIGINT -> languages.id
  metadata JSON
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_article_fragments {
  id BIGINT pk
  article_id BIGINT required -> science_almanac_articles.id
  rag_chunk_id BIGINT -> rag_chunk.id
  fragment_type ENUM('heading','paragraph','quote','table','figure','caption','formula','reference','footnote','other') required
  order_number INT required
  page_number INT
  content TEXT required
  metadata JSON
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table sciences {
  id BIGINT pk
  name VARCHAR(100) unique required
  description TEXT
  parent_science_id BIGINT -> sciences.id
  classification_code VARCHAR(50)
  research_areas TEXT
  historical_context TEXT
  key_theories TEXT
  methodological_approaches TEXT
  related_disciplines TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_categories {
  id BIGINT pk
  science_id BIGINT required -> sciences.id
  name VARCHAR(100) required
  parent_category_id BIGINT -> science_categories.id
  description TEXT
  categorization_criteria TEXT
  examples TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_periods {
  id BIGINT pk
  name VARCHAR(100) required
  start_year INT required
  end_year INT
  description TEXT
  is_active BOOLEAN
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_works {
  id BIGINT pk
  title VARCHAR(255) required
  abstract TEXT
  object TEXT
  subject TEXT
  hypothesis TEXT
  goals TEXT
  tasks TEXT
  methodology TEXT
  relevance TEXT
  novelty TEXT
  description TEXT
  sample_size INT
  year INT required
  work_period_id BIGINT -> work_periods.id
  source_article_id BIGINT -> science_almanac_articles.id
  url VARCHAR(500)
  data JSON
  status ENUM('planning','in_progress','completed','published','archived') required
  evidence_level VARCHAR(100)
  study_design VARCHAR(100)
  population_description TEXT
  clinical_domain VARCHAR(255)
  department_id BIGINT -> departments.id
  estimated_budget DECIMAL(15,2)
  actual_budget DECIMAL(15,2)
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_authors {
  id BIGINT pk
  first_name VARCHAR(100) required
  last_name VARCHAR(100) required
  middle_name VARCHAR(100)
  birth_year INT
  death_year INT
  nationality VARCHAR(100)
  institution VARCHAR(255)
  biography TEXT
  email VARCHAR(100)
  orcid_id VARCHAR(50) unique
  scopus_id VARCHAR(50)
  web_of_science_id VARCHAR(50)
  google_scholar_id VARCHAR(100)
  research_areas TEXT
  profile_photo_url VARCHAR(500)
  personal_website VARCHAR(500)
  social_media_links JSON
  is_active BOOLEAN
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_authors {
  id BIGINT pk
  science_author_id BIGINT required -> science_authors.id
  science_work_id BIGINT required -> science_works.id
  affiliation VARCHAR(255)
  role ENUM('primary','contributor','advisor','reviewer','editor') required
  contribution_description TEXT
  order_number INT required
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_publications {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  title VARCHAR(255) required
  journal VARCHAR(255)
  type ENUM('article','book','conference','thesis','report','patent','preprint','other') required
  year INT required
  doi VARCHAR(100) unique
  citation TEXT
  abstract TEXT
  keywords TEXT
  publication_date DATE
  publisher VARCHAR(255)
  volume VARCHAR(50)
  issue VARCHAR(50)
  pages VARCHAR(50)
  impact_factor DECIMAL(5,2)
  is_peer_reviewed BOOLEAN
  publication_status ENUM('submitted','under_review','accepted','published','rejected') required
  url VARCHAR(500)
  pdf_url VARCHAR(500)
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_categories {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  science_category_id BIGINT required -> science_categories.id
  relevance_score DECIMAL(3,2)
  notes TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_concept_profiles {
  id BIGINT pk
  concept_id BIGINT required -> concepts.id
  science_id BIGINT required -> sciences.id
  etymology TEXT
  historical_development TEXT
  usage_context TEXT
  alternative_definitions TEXT
  common_misconceptions TEXT
  see_also TEXT
  is_controversial BOOLEAN
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_concept_relations {
  id BIGINT pk
  concept_from_id BIGINT required -> concepts.id
  concept_to_id BIGINT required -> concepts.id
  relation_type ENUM('synonym','antonym','broader','narrower','related','part_of','has_part','derived_from','causes','contradicts','modulates','inhibits','stimulates','biomarker_of','protocol_for','risk_factor_for') required
  description TEXT
  weight DECIMAL(3,2)
  evidence_work_id BIGINT -> science_works.id
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_concept_work_mentions {
  id BIGINT pk
  concept_id BIGINT required -> concepts.id
  science_work_id BIGINT -> science_works.id
  article_id BIGINT -> science_almanac_articles.id
  fragment_id BIGINT -> science_article_fragments.id
  is_primary BOOLEAN
  page VARCHAR(20)
  quote TEXT
  contribution_type ENUM('definition','refinement','critique','application','extension','measurement','intervention','outcome') required
  significance ENUM('groundbreaking','major','notable','minor') required
  notes TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_methods {
  id BIGINT pk
  name VARCHAR(255) required
  description TEXT required
  first_used_year INT
  technical_details TEXT
  methodology_type ENUM('qualitative','quantitative','mixed','experimental','observational','computational','theoretical') required
  reliability_score DECIMAL(3,1)
  validity_score DECIMAL(3,1)
  advantages TEXT
  limitations TEXT
  required_equipment TEXT
  required_expertise TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_methods {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  science_method_id BIGINT required -> science_methods.id
  parameters TEXT
  application_details TEXT
  success_level ENUM('highly_successful','successful','neutral','problematic','unsuccessful') required
  lessons_learned TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table method_parameters {
  id BIGINT pk
  science_method_id BIGINT required -> science_methods.id
  name VARCHAR(100) required
  description TEXT required
  measurement_unit VARCHAR(50)
  data_type ENUM('numeric','text','boolean','datetime','enumeration','other') required
  possible_values TEXT
  default_value VARCHAR(255)
  min_value VARCHAR(50)
  max_value VARCHAR(50)
  is_required BOOLEAN
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_method_parameters {
  id BIGINT pk
  work_method_id BIGINT required -> work_methods.id
  method_parameter_id BIGINT required -> method_parameters.id
  typical_range VARCHAR(100)
  actual_value VARCHAR(255) required
  notes TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_equipment {
  id BIGINT pk
  name VARCHAR(255) required
  description TEXT required
  first_developed_year INT
  technical_specs TEXT
  manufacturer VARCHAR(255)
  model_number VARCHAR(100)
  calibration_requirements TEXT
  maintenance_requirements TEXT
  estimated_cost DECIMAL(15,2)
  lifespan_years INT
  power_requirements VARCHAR(100)
  size_dimensions VARCHAR(100)
  weight VARCHAR(50)
  hazard_level ENUM('none','low','medium','high','extreme') required
  safety_precautions TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_equipment {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  science_equipment_id BIGINT required -> science_equipment.id
  usage_details TEXT
  start_date DATE
  end_date DATE
  performance_notes TEXT
  problems_encountered TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table photobiomodulation_protocols {
  id BIGINT pk
  name VARCHAR(255) required
  description TEXT
  target_condition VARCHAR(255)
  anatomical_target VARCHAR(255)
  wavelength_nm_min DECIMAL(8,2)
  wavelength_nm_max DECIMAL(8,2)
  light_source_type ENUM('laser','led','broadband','combined','other') required
  delivery_mode ENUM('transcranial','intranasal','transdermal','intraoral','ocular','whole_body','localized','other') required
  continuous_or_pulsed ENUM('continuous','pulsed','mixed') required
  pulse_frequency_hz DECIMAL(10,3)
  irradiance_mw_cm2 DECIMAL(10,3)
  fluence_j_cm2 DECIMAL(10,3)
  energy_j DECIMAL(10,3)
  session_duration_seconds INT
  session_count INT
  schedule_description TEXT
  expected_mechanisms TEXT
  expected_outcomes TEXT
  contraindications TEXT
  safety_notes TEXT
  evidence_level VARCHAR(100)
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table neurophotonic_products {
  id BIGINT pk
  product_id BIGINT required -> products.id
  protocol_id BIGINT -> photobiomodulation_protocols.id
  neural_entrainment_type ENUM('audio','visual','combined','none','other') required
  frequency_range VARCHAR(100)
  therapeutic_purpose TEXT
  clinical_validation_status ENUM('theoretical','laboratory','clinical_trials','validated','approved') required
  safety_level ENUM('general_public','supervised_use','professional_only','research_only') required
  contraindications TEXT
  recommended_usage_protocol TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table neural_entrainment_sessions {
  id BIGINT pk
  neurophotonic_product_id BIGINT required -> neurophotonic_products.id
  protocol_id BIGINT -> photobiomodulation_protocols.id
  protocol_name VARCHAR(255) required
  session_duration INT required
  frequency_pattern TEXT
  intensity_profile TEXT
  target_brain_state TEXT
  expected_outcomes TEXT
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table pbm_protocol_evidence {
  id BIGINT pk
  protocol_id BIGINT required -> photobiomodulation_protocols.id
  science_work_id BIGINT required -> science_works.id
  evidence_role ENUM('primary_support','partial_support','contradiction','safety_signal','mechanism','reviewed_background') required
  population TEXT
  sample_size INT
  outcome_summary TEXT
  effect_direction ENUM('positive','negative','mixed','none','unclear') required
  evidence_quality ENUM('very_low','low','moderate','high') required
  notes TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table pbm_biological_targets {
  id BIGINT pk
  concept_id BIGINT -> concepts.id
  name VARCHAR(255) required
  target_type ENUM('molecule','organelle','cell_type','tissue','brain_region','pathway','biomarker','physiological_state','other') required
  description TEXT
  evidence_summary TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table pbm_protocol_targets {
  id BIGINT pk
  protocol_id BIGINT required -> photobiomodulation_protocols.id
  target_id BIGINT required -> pbm_biological_targets.id
  mechanism_description TEXT
  expected_effect ENUM('stimulates','inhibits','modulates','normalizes','unknown') required
  evidence_work_id BIGINT -> science_works.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table pbm_outcome_measures {
  id BIGINT pk
  concept_id BIGINT -> concepts.id
  name VARCHAR(255) required
  measurement_domain ENUM('cognition','mood','sleep','pain','inflammation','mitochondrial','blood_flow','brain_activity','performance','safety','other') required
  instrument VARCHAR(255)
  unit VARCHAR(50)
  description TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table pbm_work_outcomes {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  outcome_measure_id BIGINT required -> pbm_outcome_measures.id
  baseline_value VARCHAR(100)
  post_value VARCHAR(100)
  change_value VARCHAR(100)
  effect_size VARCHAR(100)
  p_value VARCHAR(100)
  confidence_interval VARCHAR(100)
  result_summary TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table pbm_safety_events {
  id BIGINT pk
  science_work_id BIGINT -> science_works.id
  protocol_id BIGINT -> photobiomodulation_protocols.id
  event_name VARCHAR(255) required
  severity ENUM('mild','moderate','severe','serious','unknown') required
  frequency VARCHAR(100)
  description TEXT
  mitigation TEXT
  is_contraindication BOOLEAN
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table work_results {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  description TEXT required
  quantitative_data TEXT
  statistical_significance DECIMAL(10,6)
  implications TEXT
  result_type ENUM('primary','secondary','unexpected','negative','inconclusive') required
  verification_method TEXT
  reproducibility_steps TEXT
  data_url VARCHAR(500)
  visual_representation_url VARCHAR(500)
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table science_discoveries {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  name VARCHAR(255) required
  description TEXT required
  significance TEXT
  discovery_date DATE
  patent_number VARCHAR(100)
  patent_filing_date DATE
  patent_approval_date DATE
  is_commercialized BOOLEAN
  commercial_value DECIMAL(15,2)
  validation_status ENUM('theoretical','experimental','peer_reviewed','widely_accepted','controversial') required
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table discovery_applications {
  id BIGINT pk
  related_discovery_id BIGINT required -> science_discoveries.id
  name VARCHAR(255) required
  description TEXT required
  first_used_year INT
  industry VARCHAR(100)
  use_case TEXT
  benefits TEXT
  limitations TEXT
  adoption_level ENUM('theoretical','prototype','early_adoption','mainstream','declining') required
  economic_impact DECIMAL(15,2)
  societal_impact TEXT
  created_by_user_id BIGINT required -> users.id
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table intellectual_property_assets {
  id BIGINT pk
  asset_name VARCHAR(255) required
  asset_type ENUM('patent','copyright','trademark','trade_secret','know_how','database_right','other') required
  reference_number VARCHAR(100)
  jurisdiction VARCHAR(100)
  filing_date DATE
  grant_date DATE
  expiration_date DATE
  inventors JSON
  owners JSON
  legal_status ENUM('pending','registered','granted','maintained','abandoned','expired','disputed') required
  scope_of_protection TEXT
  related_science_work_id BIGINT -> science_works.id
  commercialization_status ENUM('not_commercialized','licensing','direct_use','joint_venture','spin_off','sale') required
  estimated_value DECIMAL(15,2)
  valuation_date DATE
  valuation_method VARCHAR(100)
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table commercialization_pathways {
  id BIGINT pk
  name VARCHAR(255) required
  description TEXT
  total_estimated_time INT
  total_estimated_budget DECIMAL(15,2)
  success_probability DECIMAL(5,2)
  risk_assessment TEXT
  resource_requirements JSON
  critical_success_factors TEXT
  is_active BOOLEAN
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table commercialization_stages {
  id BIGINT pk
  pathway_id BIGINT required -> commercialization_pathways.id
  stage_name VARCHAR(100) required
  stage_order INT required
  description TEXT
  expected_duration INT
  estimated_cost DECIMAL(15,2)
  key_activities TEXT
  deliverables TEXT
  required_expertise JSON
  exit_criteria TEXT
  dependency_type ENUM('linear','flexible','milestone_based') required
  dependency_conditions JSON
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table commercialization_projects {
  id BIGINT pk
  science_work_id BIGINT required -> science_works.id
  pathway_id BIGINT required -> commercialization_pathways.id
  project_name VARCHAR(255) required
  project_manager_user_id BIGINT required -> users.id
  current_stage_id BIGINT -> commercialization_stages.id
  start_date DATE required
  planned_end_date DATE
  actual_end_date DATE
  status ENUM('planning','in_progress','on_hold','completed','cancelled') required
  progress_percentage DECIMAL(5,2)
  budget DECIMAL(15,2)
  actual_spend DECIMAL(15,2)
  target_product_id BIGINT -> products.id
  risks_and_challenges TEXT
  success_metrics JSON
  resource_allocation_plan JSON
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table stage_activities {
  id BIGINT pk
  project_id BIGINT required -> commercialization_projects.id
  stage_id BIGINT required -> commercialization_stages.id
  activity_name VARCHAR(100) required
  description TEXT
  start_date DATE
  end_date DATE
  status ENUM('planned','in_progress','completed','blocked','cancelled') required
  responsible_user_id BIGINT -> users.id
  estimated_hours DECIMAL(8,2)
  actual_hours DECIMAL(8,2)
  dependencies JSON
  output_deliverables TEXT
  notes TEXT
  created_at TIMESTAMP required
  updated_at TIMESTAMP required
}

table technology_readiness_assessments {
  id BIGINT pk
  project_id BIGINT required -> commercialization_projects.id
  assessment_date DATE required
  trl_level INT required
  evidence TEXT
  assessor_user_id BIGINT required -> users.id
  gaps_identified TEXT
  recommended_actions TEXT
  next_assessment_date DATE
  created_at TIMESTAMP required
}`;
