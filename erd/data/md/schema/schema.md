CREATE TABLE users (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) NOT NULL UNIQUE,
email VARCHAR(100) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
first_name VARCHAR(50),
last_name VARCHAR(50),
role_id BIGINT NOT NULL, -- Внешний ключ к roles
phone_number VARCHAR(20),
is_active BOOLEAN DEFAULT true,
last_login_at TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE roles (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50) NOT NULL UNIQUE,
description TEXT,
permissions JSON, -- Хранение разрешений в формате JSON
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(100) NOT NULL,
phone VARCHAR(20),
first_name VARCHAR(50),
last_name VARCHAR(50),
customer_id BIGINT, -- Внешний ключ к customers
source_channel_id BIGINT, -- Внешний ключ к источникам
campaign_id BIGINT, -- Внешний ключ к кампаниям
status ENUM('new', 'qualified', 'converted', 'disqualified') DEFAULT 'new',
lead_score DECIMAL(5,2) DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
lead_source VARCHAR(100),
segment_id BIGINT, -- Внешний ключ к сегментам
acquisition_cost DECIMAL(10,2),
CONSTRAINT fk_contact_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
CONSTRAINT fk_contact_source FOREIGN KEY (source_channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_contact_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_contact_segment FOREIGN KEY (segment_id) REFERENCES market_segments(id)
);

CREATE TABLE contact_utm_data (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
utm_source VARCHAR(100),
utm_medium VARCHAR(100),
utm_campaign VARCHAR(100),
utm_term VARCHAR(100),
utm_content VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_utm_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE communication_channels (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
type ENUM('social_media', 'email', 'messenger', 'sms', 'push', 'call_center', 'direct') NOT NULL,
settings JSON,
api_credentials JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
description TEXT,
is_active BOOLEAN DEFAULT true,
placement_cost DECIMAL(10,2),
cost_per_click DECIMAL(10,2),
responsible_user_id BIGINT,
CONSTRAINT fk_channel_user FOREIGN KEY (responsible_user_id) REFERENCES users(id)
);

CREATE TABLE messages (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
subject VARCHAR(255),
content TEXT NOT NULL,
title VARCHAR(255),
description TEXT,
url VARCHAR(255),
channel_id BIGINT NOT NULL, -- Внешний ключ к каналам
content_type ENUM('email', 'push', 'sms', 'social', 'in_app') NOT NULL,
settings JSON,
status ENUM('draft', 'scheduled', 'sent', 'failed') DEFAULT 'draft',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
scheduled_at TIMESTAMP,
sent_at TIMESTAMP,
campaign_id BIGINT, -- Внешний ключ к кампаниям
content_block_id BIGINT, -- Внешний ключ к блокам контента
template_id BIGINT, -- Внешний ключ к шаблонам
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_message_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_message_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_message_content FOREIGN KEY (content_block_id) REFERENCES content_blocks(id),
CONSTRAINT fk_message_template FOREIGN KEY (template_id) REFERENCES message_templates(id),
CONSTRAINT fk_message_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE message_templates (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
content TEXT NOT NULL,
content_type ENUM('email', 'push', 'sms', 'social', 'in_app') NOT NULL,
variables JSON, -- Переменные, которые можно использовать в шаблоне
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
is_active BOOLEAN DEFAULT true,
CONSTRAINT fk_template_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE social_media_posts (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
channel_id BIGINT NOT NULL, -- Внешний ключ к каналам
campaign_id BIGINT, -- Внешний ключ к кампаниям
content TEXT NOT NULL,
media_urls JSON, -- Ссылки на медиа-файлы (фото, видео)
published_at TIMESTAMP,
scheduled_at TIMESTAMP,
type ENUM('text', 'image', 'video', 'link', 'carousel', 'story') NOT NULL,
settings JSON,
status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
content_block_id BIGINT, -- Внешний ключ к блокам контента
placement_cost DECIMAL(10,2),
target_audience_reach INT,
created_by_user_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_post_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_post_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_post_content FOREIGN KEY (content_block_id) REFERENCES content_blocks(id),
CONSTRAINT fk_post_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE landing_pages (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
url_slug VARCHAR(100) NOT NULL UNIQUE,
type ENUM('product', 'service', 'event', 'lead_capture', 'promotion') NOT NULL,
content JSON,
campaign_id BIGINT, -- Внешний ключ к кампаниям
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
published_at TIMESTAMP,
is_active BOOLEAN DEFAULT true,
creation_cost DECIMAL(10,2),
seo_title VARCHAR(255),
seo_description TEXT,
seo_keywords TEXT,
created_by_user_id BIGINT NOT NULL,
header_id BIGINT, -- Внешний ключ к блокам контента (шапка)
footer_id BIGINT, -- Внешний ключ к блокам контента (подвал)
CONSTRAINT fk_page_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_page_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_page_header FOREIGN KEY (header_id) REFERENCES content_blocks(id),
CONSTRAINT fk_page_footer FOREIGN KEY (footer_id) REFERENCES content_blocks(id)
);

CREATE TABLE landing_page_sections (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
landing_page_id BIGINT NOT NULL,
content_block_id BIGINT NOT NULL,
position INT NOT NULL, -- Порядок блока на странице
settings JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_section_page FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id),
CONSTRAINT fk_section_block FOREIGN KEY (content_block_id) REFERENCES content_blocks(id)
);

CREATE TABLE content_blocks (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
type ENUM('text', 'image', 'video', 'form', 'header', 'footer', 'gallery', 'testimonial', 'cta', 'feature') NOT NULL,
content JSON NOT NULL,
settings JSON,
campaign_id BIGINT, -- Внешний ключ к кампаниям
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
is_reusable BOOLEAN DEFAULT false,
css_class VARCHAR(100),
CONSTRAINT fk_block_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_block_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE interactions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL, -- Внешний ключ к контактам
type ENUM('email_open', 'email_click', 'page_visit', 'form_submit', 'call', 'chat', 'purchase', 'social_engagement') NOT NULL,
interaction_time TIMESTAMP NOT NULL,
interaction_data JSON,
channel_id BIGINT, -- Внешний ключ к каналам
landing_page_id BIGINT, -- Внешний ключ к посадочным страницам
content_block_id BIGINT, -- Внешний ключ к блокам контента
message_id BIGINT, -- Внешний ключ к сообщениям
device_type VARCHAR(50),
browser VARCHAR(50),
ip_address VARCHAR(45), -- IPv6-compatible
session_id VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_interaction_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_interaction_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_interaction_page FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id),
CONSTRAINT fk_interaction_block FOREIGN KEY (content_block_id) REFERENCES content_blocks(id),
CONSTRAINT fk_interaction_message FOREIGN KEY (message_id) REFERENCES messages(id)
);

CREATE TABLE communication_preferences (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
channel_id BIGINT NOT NULL,
is_subscribed BOOLEAN DEFAULT true,
frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'never') DEFAULT 'weekly',
preferred_time_start TIME,
preferred_time_end TIME,
last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_preferences_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_preferences_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
UNIQUE KEY unique_contact_channel (contact_id, channel_id)
);

CREATE TABLE audit_logs (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
entity_type VARCHAR(50) NOT NULL,
entity_id BIGINT NOT NULL,
action_type ENUM('create', 'update', 'delete', 'login', 'logout', 'export', 'import') NOT NULL,
action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
user_id BIGINT NOT NULL,
previous_state JSON,
new_state JSON,
ip_address VARCHAR(45),
user_agent TEXT,
CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE communication_schedules (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
channel_id BIGINT NOT NULL,
message_template_id BIGINT NOT NULL,
segment_id BIGINT, -- Внешний ключ к сегментам рынка
frequency ENUM('once', 'daily', 'weekly', 'monthly', 'custom') NOT NULL,
cron_expression VARCHAR(100), -- Для custom schedule
start_date DATE NOT NULL,
end_date DATE,
active BOOLEAN DEFAULT true,
created_by_user_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_schedule_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_schedule_template FOREIGN KEY (message_template_id) REFERENCES message_templates(id),
CONSTRAINT fk_schedule_segment FOREIGN KEY (segment_id) REFERENCES market_segments(id),
CONSTRAINT fk_schedule_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE contact_notes (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
note TEXT NOT NULL,
created_by_user_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_note_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_note_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE communication_team_members (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
user_id BIGINT NOT NULL,
channel_id BIGINT NOT NULL,
role ENUM('manager', 'content_creator', 'analyst', 'support') NOT NULL,
assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
is_active BOOLEAN DEFAULT true,
CONSTRAINT fk_team_user FOREIGN KEY (user_id) REFERENCES users(id),
CONSTRAINT fk_team_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
UNIQUE KEY unique_user_channel_role (user_id, channel_id, role)
);

CREATE TABLE campaigns (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
start_date TIMESTAMP NOT NULL,
end_date TIMESTAMP,
type ENUM('email', 'social_media', 'content', 'ppc', 'display', 'event', 'integrated') NOT NULL,
settings JSON,
is_active BOOLEAN DEFAULT true,
budget DECIMAL(15,2),
status ENUM('planned', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'planned',
target_audience_id BIGINT, -- Внешний ключ к целевой аудитории
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
current_expenses DECIMAL(15,2) DEFAULT 0,
goals JSON, -- Целевые показатели кампании
parent_campaign_id BIGINT, -- Для иерархии кампаний
CONSTRAINT fk_campaign_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_campaign_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_campaign_parent FOREIGN KEY (parent_campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE campaign_channels (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
campaign_id BIGINT NOT NULL,
channel_id BIGINT NOT NULL,
budget_allocation DECIMAL(15,2),
start_date TIMESTAMP NOT NULL,
end_date TIMESTAMP,
kpi_targets JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_campaign_channel_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_campaign_channel_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
UNIQUE KEY unique_campaign_channel (campaign_id, channel_id)
);

CREATE TABLE funnel_stages (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
order_number INT NOT NULL,
campaign_id BIGINT, -- Может быть NULL для общих этапов
target_conversion_rate DECIMAL(5,2),
expected_duration INT, -- Ожидаемая длительность этапа в днях
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
criteria JSON, -- Критерии перехода на следующий этап
CONSTRAINT fk_stage_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE funnel_transitions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
from_stage_id BIGINT, -- NULL для входа в воронку
to_stage_id BIGINT NOT NULL,
contact_id BIGINT NOT NULL,
transition_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
campaign_id BIGINT,
channel_id BIGINT, -- Через какой канал произошел переход
trigger_id BIGINT, -- Какой триггер вызвал переход
notes TEXT,
CONSTRAINT fk_transition_from FOREIGN KEY (from_stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_transition_to FOREIGN KEY (to_stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_transition_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_transition_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_transition_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_transition_trigger FOREIGN KEY (trigger_id) REFERENCES triggers(id)
);

CREATE TABLE triggers (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
type ENUM('event', 'behavior', 'time', 'score', 'manual') NOT NULL,
conditions JSON NOT NULL, -- Условия срабатывания
next_stage_id BIGINT, -- К какому этапу воронки переводит
campaign_id BIGINT, -- Может быть NULL для общих триггеров
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
description TEXT,
priority INT DEFAULT 0, -- Приоритет срабатывания
CONSTRAINT fk_trigger_stage FOREIGN KEY (next_stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_trigger_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_trigger_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE actions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
type ENUM('send_email', 'send_sms', 'create_task', 'update_contact', 'webhook', 'notification', 'change_stage') NOT NULL,
settings JSON NOT NULL, -- Параметры действия
trigger_id BIGINT NOT NULL,
execution_order INT DEFAULT 0, -- Порядок выполнения в рамках триггера
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
description TEXT,
delay_minutes INT DEFAULT 0, -- Задержка выполнения после срабатывания триггера
CONSTRAINT fk_action_trigger FOREIGN KEY (trigger_id) REFERENCES triggers(id),
CONSTRAINT fk_action_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE action_executions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
action_id BIGINT NOT NULL,
trigger_id BIGINT NOT NULL,
contact_id BIGINT NOT NULL,
executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
result JSON, -- Результат выполнения
error_message TEXT,
CONSTRAINT fk_execution_action FOREIGN KEY (action_id) REFERENCES actions(id),
CONSTRAINT fk_execution_trigger FOREIGN KEY (trigger_id) REFERENCES triggers(id),
CONSTRAINT fk_execution_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE landing_page_metrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
landing_page_id BIGINT NOT NULL,
date DATE NOT NULL,
visits INT DEFAULT 0,
unique_visitors INT DEFAULT 0,
bounce_rate DECIMAL(5,2) DEFAULT 0,
avg_time_on_page DECIMAL(10,2) DEFAULT 0, -- В секундах
conversions INT DEFAULT 0,
conversion_rate DECIMAL(5,2) DEFAULT 0,
heatmap_data JSON,
additional_metrics JSON,
source_breakdown JSON, -- Статистика по источникам трафика
device_breakdown JSON, -- Статистика по устройствам
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_metrics_page FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id),
UNIQUE KEY unique_page_date (landing_page_id, date)
);

CREATE TABLE a_b_tests (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
start_date TIMESTAMP NOT NULL,
end_date TIMESTAMP,
campaign_id BIGINT,
variants JSON NOT NULL, -- Варианты тестирования
status ENUM('draft', 'running', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
winning_variant VARCHAR(100),
confidence_level DECIMAL(5,2), -- Уровень уверенности в результате
primary_metric VARCHAR(100) NOT NULL, -- Основная метрика для определения победителя
secondary_metrics JSON, -- Дополнительные метрики
traffic_allocation DECIMAL(5,2) DEFAULT 100.00, -- Процент трафика для теста
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
entity_type ENUM('landing_page', 'email', 'ad', 'content_block') NOT NULL,
entity_id BIGINT NOT NULL, -- ID тестируемой сущности
CONSTRAINT fk_test_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_test_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE a_b_test_results (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
test_id BIGINT NOT NULL,
variant VARCHAR(100) NOT NULL,
date DATE NOT NULL,
impressions INT DEFAULT 0,
conversions INT DEFAULT 0,
conversion_rate DECIMAL(5,2) DEFAULT 0,
metrics JSON, -- Все метрики для варианта
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_result_test FOREIGN KEY (test_id) REFERENCES a_b_tests(id),
UNIQUE KEY unique_test_variant_date (test_id, variant, date)
);

CREATE TABLE upsell_opportunities (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
primary_product_id BIGINT NOT NULL, -- Основной продукт
upsell_product_id BIGINT NOT NULL, -- Предлагаемый дополнительный продукт
priority_score DECIMAL(5,2) DEFAULT 0,
type ENUM('upsell', 'cross_sell', 'bundle', 'add_on') NOT NULL,
rules JSON, -- Правила показа предложения
discount_percentage DECIMAL(5,2) DEFAULT 0,
display_order INT DEFAULT 0,
is_active BOOLEAN DEFAULT true,
start_date DATE,
end_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
success_rate DECIMAL(5,2) DEFAULT 0, -- Исторический процент успешных допродаж
CONSTRAINT fk_upsell_primary FOREIGN KEY (primary_product_id) REFERENCES products(id),
CONSTRAINT fk_upsell_product FOREIGN KEY (upsell_product_id) REFERENCES products(id),
CONSTRAINT fk_upsell_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
UNIQUE KEY unique_product_pair (primary_product_id, upsell_product_id)
);

CREATE TABLE brands (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
company_id BIGINT NOT NULL,
name VARCHAR(100) NOT NULL,
logo_url VARCHAR(255),
launch_date DATE,
status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
description TEXT,
brand_guidelines TEXT,
color_palette VARCHAR(255),
tagline VARCHAR(255),
website_url VARCHAR(255),
social_media_handles JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_brand_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE brand_4d (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
brand_id BIGINT NOT NULL,
dimension_type ENUM('functional', 'social', 'mental', 'spiritual') NOT NULL,
score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
analysis TEXT,
description TEXT,
strengths TEXT,
weaknesses TEXT,
opportunities TEXT, -- Добавлено для SWOT-анализа
threats TEXT, -- Добавлено для SWOT-анализа
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
evaluated_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_4d_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
CONSTRAINT fk_4d_user FOREIGN KEY (evaluated_by_user_id) REFERENCES users(id),
UNIQUE KEY unique_brand_dimension (brand_id, dimension_type)
);

CREATE TABLE market_segments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
brand_id BIGINT, -- Может быть NULL для общих сегментов
geography TEXT, -- Регионы охвата
avg_audience_income DECIMAL(15,2),
criteria JSON, -- Критерии отбора контактов
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
potential_market_size BIGINT, -- Оценка размера сегмента
growth_rate DECIMAL(5,2), -- Темп роста сегмента в процентах
competition_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
profitability_index DECIMAL(5,2), -- Индекс прибыльности сегмента
CONSTRAINT fk_segment_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
CONSTRAINT fk_segment_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE target_audiences (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
segment_id BIGINT NOT NULL,
age_min INT,
age_max INT,
gender VARCHAR(20), -- 'male', 'female', 'all'
income_level ENUM('low', 'medium', 'high', 'premium'),
psychographics TEXT, -- Интересы, ценности, стиль жизни
behaviors TEXT, -- Поведенческие характеристики
consumer_habits TEXT, -- Привычки потребления
education_level ENUM('primary', 'secondary', 'higher', 'postgraduate'),
occupation TEXT,
location_targeting JSON, -- Географический таргетинг
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
estimated_size BIGINT, -- Примерный размер аудитории
CONSTRAINT fk_audience_segment FOREIGN KEY (segment_id) REFERENCES market_segments(id),
CONSTRAINT fk_audience_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE value_propositions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
landing_page_id BIGINT, -- Может быть NULL
campaign_id BIGINT, -- Может быть NULL
product_id BIGINT, -- Может быть NULL
key_benefits JSON, -- Основные выгоды
supporting_evidence TEXT, -- Подтверждающие доказательства
target_audience_id BIGINT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
is_active BOOLEAN DEFAULT true,
CONSTRAINT fk_proposition_page FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id),
CONSTRAINT fk_proposition_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_proposition_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_proposition_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_proposition_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE customer_journey_maps (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
target_audience_id BIGINT NOT NULL,
stages JSON NOT NULL, -- Этапы пути клиента (awareness, consideration, etc.)
touchpoints JSON, -- Точки контакта на каждом этапе
emotions JSON, -- Эмоциональное состояние на каждом этапе
pain_points JSON, -- Проблемные места
opportunities JSON, -- Возможности для улучшения
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_journey_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_journey_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE campaign_metrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
campaign_id BIGINT NOT NULL,
date DATE NOT NULL,
impressions BIGINT DEFAULT 0,
clicks BIGINT DEFAULT 0,
conversions INT DEFAULT 0,
cost DECIMAL(15,2) DEFAULT 0,
revenue DECIMAL(15,2) DEFAULT 0,
ctr DECIMAL(5,2) DEFAULT 0, -- Click-through rate
cpc DECIMAL(10,2) DEFAULT 0, -- Cost per click
cpa DECIMAL(10,2) DEFAULT 0, -- Cost per acquisition
roas DECIMAL(10,2) DEFAULT 0, -- Return on ad spend
channel_breakdown JSON, -- Распределение по каналам
device_breakdown JSON, -- Распределение по устройствам
geo_breakdown JSON, -- Распределение по регионам
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_metrics_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
UNIQUE KEY unique_campaign_date (campaign_id, date)
);

CREATE TABLE customer_personas (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
target_audience_id BIGINT NOT NULL,
demographic_details JSON, -- Демографические данные
goals TEXT, -- Цели и задачи
challenges TEXT, -- Проблемы и вызовы
preferred_channels JSON, -- Предпочитаемые каналы коммуникации
buying_process TEXT, -- Процесс принятия решения о покупке
story TEXT, -- История персоны
avatar_url VARCHAR(255), -- URL изображения персоны
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_persona_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_persona_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE messaging_frameworks (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
brand_id BIGINT NOT NULL,
name VARCHAR(100) NOT NULL,
target_audience_id BIGINT NOT NULL,
value_proposition_id BIGINT,
key_messages JSON NOT NULL, -- Основные сообщения
tone_of_voice TEXT, -- Тон коммуникации
dos_and_donts JSON, -- Что делать и чего не делать
examples TEXT, -- Примеры коммуникации
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_framework_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
CONSTRAINT fk_framework_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_framework_proposition FOREIGN KEY (value_proposition_id) REFERENCES value_propositions(id),
CONSTRAINT fk_framework_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE orders (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
order_number VARCHAR(50) NOT NULL UNIQUE, -- Внешний номер заказа
contact_id BIGINT NOT NULL,
order_date TIMESTAMP NOT NULL,
order_total DECIMAL(15,2) NOT NULL,
tax_amount DECIMAL(15,2) DEFAULT 0,
shipping_amount DECIMAL(15,2) DEFAULT 0,
discount_amount DECIMAL(15,2) DEFAULT 0,
payment_method ENUM('credit_card', 'bank_transfer', 'paypal', 'cash', 'crypto', 'other') NOT NULL,
payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
order_status ENUM('new', 'processing', 'on_hold', 'completed', 'cancelled', 'refunded') DEFAULT 'new',
fulfillment_status ENUM('pending', 'partial', 'fulfilled', 'returned') DEFAULT 'pending',
shipping_address_id BIGINT, -- Внешний ключ к адресам
billing_address_id BIGINT, -- Внешний ключ к адресам
campaign_id BIGINT, -- Внешний ключ к кампаниям
landing_page_id BIGINT, -- Внешний ключ к посадочным страницам
channel_id BIGINT, -- Внешний ключ к каналам
profit DECIMAL(15,2),
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
customer_po VARCHAR(100), -- Номер заказа клиента
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
CONSTRAINT fk_order_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_order_shipping FOREIGN KEY (shipping_address_id) REFERENCES addresses(id),
CONSTRAINT fk_order_billing FOREIGN KEY (billing_address_id) REFERENCES addresses(id),
CONSTRAINT fk_order_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_order_landing FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id),
CONSTRAINT fk_order_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id)
);

CREATE TABLE addresses (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
address_type ENUM('shipping', 'billing', 'both') DEFAULT 'both',
address_line1 VARCHAR(255) NOT NULL,
address_line2 VARCHAR(255),
city VARCHAR(100) NOT NULL,
state VARCHAR(100),
postal_code VARCHAR(20),
country VARCHAR(100) NOT NULL,
is_default BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_address_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE order_items (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
order_id BIGINT NOT NULL,
product_id BIGINT NOT NULL,
quantity INT NOT NULL,
unit_price DECIMAL(15,2) NOT NULL, -- Цена за единицу на момент заказа
base_price DECIMAL(15,2) NOT NULL, -- Базовая цена без скидок
discount_amount DECIMAL(15,2) DEFAULT 0,
discount_percentage DECIMAL(5,2) DEFAULT 0,
tax_amount DECIMAL(15,2) DEFAULT 0,
tax_percentage DECIMAL(5,2) DEFAULT 0,
item_total DECIMAL(15,2) NOT NULL, -- Итоговая сумма за позицию
cost_price DECIMAL(15,2), -- Себестоимость единицы
profit DECIMAL(15,2), -- Прибыль по позиции
upsell_source_id BIGINT, -- Ссылка на источник допродажи
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
sku VARCHAR(100), -- Артикул
product_name VARCHAR(255), -- Название товара на момент заказа
options JSON, -- Выбранные опции (цвет, размер и т.д.)
is_digital BOOLEAN DEFAULT false, -- Цифровой товар или физический
CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id),
CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_item_upsell FOREIGN KEY (upsell_source_id) REFERENCES upsell_opportunities(id)
);

CREATE TABLE payments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
order_id BIGINT NOT NULL,
amount DECIMAL(15,2) NOT NULL,
payment_method ENUM('credit_card', 'bank_transfer', 'paypal', 'cash', 'crypto', 'other') NOT NULL,
payment_date TIMESTAMP NOT NULL,
status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
transaction_id VARCHAR(255), -- Внешний ID транзакции
payment_details JSON, -- Детали платежа (маскированный номер карты и т.д.)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
processor_fee DECIMAL(10,2) DEFAULT 0, -- Комиссия платежной системы
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE refunds (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
order_id BIGINT NOT NULL,
payment_id BIGINT,
amount DECIMAL(15,2) NOT NULL,
refund_date TIMESTAMP NOT NULL,
reason TEXT,
status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
refund_transaction_id VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
processed_by_user_id BIGINT,
refund_method ENUM('original_payment', 'store_credit', 'bank_transfer', 'other') DEFAULT 'original_payment',
CONSTRAINT fk_refund_order FOREIGN KEY (order_id) REFERENCES orders(id),
CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
CONSTRAINT fk_refund_user FOREIGN KEY (processed_by_user_id) REFERENCES users(id)
);

CREATE TABLE marketing_expenses (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
campaign_id BIGINT,
channel_id BIGINT,
date DATE NOT NULL,
amount DECIMAL(15,2) NOT NULL,
category ENUM('advertising', 'content_creation', 'event', 'sponsorship', 'influencer', 'other') NOT NULL,
description TEXT,
invoice_number VARCHAR(100),
vendor_id BIGINT, -- Внешний ключ к поставщикам
paid_date DATE,
payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
CONSTRAINT fk_expense_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_expense_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_expense_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
CONSTRAINT fk_expense_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE funding_sources (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
type ENUM('internal', 'investor', 'bank_loan', 'grant', 'crowdfunding', 'other') NOT NULL,
total_budget DECIMAL(15,2),
available_budget DECIMAL(15,2),
start_date DATE,
end_date DATE,
interest_rate DECIMAL(5,2), -- Процентная ставка для кредитов
repayment_terms TEXT, -- Условия возврата средств
contact_person VARCHAR(100),
contact_email VARCHAR(100),
contact_phone VARCHAR(20),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
status ENUM('active', 'pending', 'exhausted', 'closed') DEFAULT 'active',
currency VARCHAR(3) DEFAULT 'USD',
CONSTRAINT fk_funding_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE funding_allocations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
funding_source_id BIGINT NOT NULL,
project_id BIGINT,
department_id BIGINT,
amount DECIMAL(15,2) NOT NULL,
allocation_date DATE NOT NULL,
purpose TEXT,
status ENUM('planned', 'approved', 'allocated', 'spent', 'cancelled') DEFAULT 'planned',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
approved_by_user_id BIGINT,
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
CONSTRAINT fk_allocation_source FOREIGN KEY (funding_source_id) REFERENCES funding_sources(id),
CONSTRAINT fk_allocation_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_allocation_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_allocation_user FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE funding_thresholds (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
min_score DECIMAL(5,2) NOT NULL,
max_score DECIMAL(5,2) NOT NULL,
funding_recommendation TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
approval_level ENUM('team_lead', 'manager', 'director', 'executive', 'board') NOT NULL,
funding_percentage DECIMAL(5,2), -- Рекомендуемый процент от запрашиваемой суммы
CONSTRAINT fk_threshold_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CHECK (min_score <= max_score)
);

CREATE TABLE budget_items (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL,
name VARCHAR(100) NOT NULL,
project_id BIGINT,
department_id BIGINT,
budget_category_id BIGINT NOT NULL,
fiscal_year INT NOT NULL,
estimated_cost DECIMAL(15,2) NOT NULL,
approved_cost DECIMAL(15,2),
actual_cost DECIMAL(15,2) DEFAULT 0,
variance DECIMAL(15,2) GENERATED ALWAYS AS (approved_cost - actual_cost) STORED,
variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
CASE WHEN approved_cost > 0 THEN (actual_cost - approved_cost) / approved_cost \* 100 ELSE 0 END
) STORED,
status ENUM('draft', 'submitted', 'approved', 'rejected', 'closed') DEFAULT 'draft',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
approved_by_user_id BIGINT,
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
CONSTRAINT fk_budget_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_budget_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_budget_category FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id),
CONSTRAINT fk_budget_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_budget_approver FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE budget_categories (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
parent_category_id BIGINT,
is_expense BOOLEAN DEFAULT true, -- Расход или доход
ledger_account_id BIGINT, -- Связь с бухгалтерским счетом
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_category_parent FOREIGN KEY (parent_category_id) REFERENCES budget_categories(id),
CONSTRAINT fk_category_ledger FOREIGN KEY (ledger_account_id) REFERENCES ledger_accounts(id)
);

CREATE TABLE ledger_accounts (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
account_number VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
account_type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
parent_account_id BIGINT,
description TEXT,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
balance DECIMAL(15,2) DEFAULT 0,
currency VARCHAR(3) DEFAULT 'USD',
CONSTRAINT fk_account_parent FOREIGN KEY (parent_account_id) REFERENCES ledger_accounts(id)
);

CREATE TABLE vendors (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
company_name VARCHAR(255) NOT NULL,
contact_name VARCHAR(100),
email VARCHAR(100),
phone VARCHAR(20),
website VARCHAR(255),
address TEXT,
tax_id VARCHAR(50),
category ENUM('marketing', 'technology', 'office', 'production', 'consulting', 'other') NOT NULL,
payment_terms VARCHAR(100),
rating INT CHECK (rating BETWEEN 1 AND 5),
notes TEXT,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
bank_account_details TEXT,
preferred_payment_method ENUM('bank_transfer', 'check', 'credit_card', 'paypal', 'other') DEFAULT 'bank_transfer'
);

CREATE TABLE invoices (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
invoice_number VARCHAR(50) NOT NULL UNIQUE,
order_id BIGINT,
contact_id BIGINT NOT NULL,
vendor_id BIGINT, -- Для входящих счетов
invoice_date DATE NOT NULL,
due_date DATE NOT NULL,
total_amount DECIMAL(15,2) NOT NULL,
paid_amount DECIMAL(15,2) DEFAULT 0,
balance_due DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
status ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
type ENUM('sales', 'purchase') NOT NULL, -- Исходящий (продажа) или входящий (покупка) счет
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES orders(id),
CONSTRAINT fk_invoice_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_invoice_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
CONSTRAINT fk_invoice_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE invoice_items (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
invoice_id BIGINT NOT NULL,
product_id BIGINT,
description VARCHAR(255) NOT NULL,
quantity DECIMAL(10,2) NOT NULL,
unit_price DECIMAL(15,2) NOT NULL,
tax_rate DECIMAL(5,2) DEFAULT 0,
tax_amount DECIMAL(15,2) DEFAULT 0,
discount_amount DECIMAL(15,2) DEFAULT 0,
line_total DECIMAL(15,2) NOT NULL,
order_item_id BIGINT, -- Связь с позицией заказа
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_invoice_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
CONSTRAINT fk_invoice_item_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_invoice_item_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

CREATE TABLE financial_transactions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
transaction_date TIMESTAMP NOT NULL,
amount DECIMAL(15,2) NOT NULL,
transaction_type ENUM('sale', 'purchase', 'payment', 'refund', 'adjustment', 'transfer') NOT NULL,
description TEXT,
reference_type VARCHAR(50), -- Тип связанной сущности (order, invoice, payment, etc.)
reference_id BIGINT, -- ID связанной сущности
debit_account_id BIGINT NOT NULL,
credit_account_id BIGINT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
currency VARCHAR(3) DEFAULT 'USD',
exchange_rate DECIMAL(10,6) DEFAULT 1,
is_reconciled BOOLEAN DEFAULT false,
CONSTRAINT fk_transaction_debit FOREIGN KEY (debit_account_id) REFERENCES ledger_accounts(id),
CONSTRAINT fk_transaction_credit FOREIGN KEY (credit_account_id) REFERENCES ledger_accounts(id),
CONSTRAINT fk_transaction_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE departments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
code VARCHAR(20) NOT NULL UNIQUE,
parent_department_id BIGINT,
manager_user_id BIGINT,
budget_amount DECIMAL(15,2),
fiscal_year INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
is_active BOOLEAN DEFAULT true,
description TEXT,
CONSTRAINT fk_department_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id),
CONSTRAINT fk_department_manager FOREIGN KEY (manager_user_id) REFERENCES users(id)
);

CREATE TABLE tax_rates (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
rate DECIMAL(5,2) NOT NULL,
country VARCHAR(100) NOT NULL,
state VARCHAR(100),
is_default BOOLEAN DEFAULT false,
applies_to ENUM('product', 'service', 'all') DEFAULT 'all',
effective_date DATE NOT NULL,
expiration_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_tax_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE assets (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
asset_type ENUM('equipment', 'property', 'vehicle', 'software', 'furniture', 'intellectual', 'other') NOT NULL,
purchase_date DATE,
purchase_cost DECIMAL(15,2),
current_value DECIMAL(15,2),
depreciation_method ENUM('straight_line', 'declining_balance', 'units_of_production', 'none') DEFAULT 'straight_line',
useful_life_years INT,
salvage_value DECIMAL(15,2),
location VARCHAR(255),
department_id BIGINT,
responsible_user_id BIGINT,
status ENUM('active', 'in_repair', 'retired', 'sold', 'lost') DEFAULT 'active',
warranty_expiry_date DATE,
serial_number VARCHAR(100),
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_asset_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_asset_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id),
CONSTRAINT fk_asset_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE financial_reports (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
report_type ENUM('p_and_l', 'balance_sheet', 'cash_flow', 'budget_vs_actual', 'sales', 'tax', 'custom') NOT NULL,
name VARCHAR(255) NOT NULL,
period_start DATE NOT NULL,
period_end DATE NOT NULL,
generated_at TIMESTAMP NOT NULL,
generated_by_user_id BIGINT NOT NULL,
report_data JSON,
summary TEXT,
is_final BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
currency VARCHAR(3) DEFAULT 'USD',
CONSTRAINT fk_report_user FOREIGN KEY (generated_by_user_id) REFERENCES users(id)
);

CREATE TABLE science_works (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
abstract TEXT,
object TEXT, -- Объект исследования
subject TEXT, -- Предмет исследования
hypothesis TEXT,
goals TEXT,
tasks TEXT,
methodology TEXT,
relevance TEXT,
novelty TEXT,
description TEXT,
sample_size INT,
year INT NOT NULL,
work_period_id BIGINT,
url VARCHAR(255),
data JSON, -- Полная информация об исследовании
work_publication_id BIGINT,
status ENUM('planning', 'in_progress', 'completed', 'published', 'archived') DEFAULT 'planning',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
department_id BIGINT,
estimated_budget DECIMAL(15,2),
actual_budget DECIMAL(15,2),
CONSTRAINT fk_science_work_period FOREIGN KEY (work_period_id) REFERENCES work_periods(id),
CONSTRAINT fk_science_work_publication FOREIGN KEY (work_publication_id) REFERENCES work_publications(id),
CONSTRAINT fk_science_work_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_science_work_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE work_periods (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
start_year INT NOT NULL,
end_year INT,
description TEXT,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_period_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE science_authors (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
middle_name VARCHAR(100),
birth_year INT,
death_year INT,
nationality VARCHAR(100),
institution VARCHAR(255),
biography TEXT,
email VARCHAR(100),
orcid_id VARCHAR(50), -- Уникальный идентификатор исследователя в системе ORCID
scopus_id VARCHAR(50),
web_of_science_id VARCHAR(50),
google_scholar_id VARCHAR(100),
research_areas TEXT,
profile_photo_url VARCHAR(255),
personal_website VARCHAR(255),
social_media_links JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
is_active BOOLEAN DEFAULT true,
CONSTRAINT uk_author_orcid UNIQUE (orcid_id)
);

CREATE TABLE work_authors (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_author_id BIGINT NOT NULL,
science_work_id BIGINT NOT NULL,
affiliation VARCHAR(255), -- Организация, с которой связан автор
role ENUM('primary', 'contributor', 'advisor', 'reviewer', 'editor') NOT NULL,
contribution_description TEXT,
order_number INT NOT NULL, -- Порядок авторов в публикации
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_work_author_author FOREIGN KEY (science_author_id) REFERENCES science_authors(id),
CONSTRAINT fk_work_author_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT uk_author_work UNIQUE (science_author_id, science_work_id)
);

CREATE TABLE work_results (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
description TEXT NOT NULL,
quantitative_data TEXT,
statistical_significance DECIMAL(10,6),
implications TEXT,
result_type ENUM('primary', 'secondary', 'unexpected', 'negative', 'inconclusive') DEFAULT 'primary',
verification_method TEXT,
reproducibility_steps TEXT,
data_url VARCHAR(255), -- Ссылка на датасет
visual_representation_url VARCHAR(255), -- Ссылка на визуализацию
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_result_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_result_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE work_publications (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
title VARCHAR(255) NOT NULL,
journal VARCHAR(255),
type ENUM('article', 'book', 'conference', 'thesis', 'report', 'patent', 'preprint', 'other') NOT NULL,
year INT NOT NULL,
doi VARCHAR(100),
citation TEXT,
abstract TEXT,
keywords TEXT,
publication_date DATE,
publisher VARCHAR(255),
volume VARCHAR(50),
issue VARCHAR(50),
pages VARCHAR(50),
impact_factor DECIMAL(5,2),
is_peer_reviewed BOOLEAN DEFAULT true,
publication_status ENUM('submitted', 'under_review', 'accepted', 'published', 'rejected') DEFAULT 'submitted',
url VARCHAR(255),
pdf_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_publication_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_publication_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_publication_doi UNIQUE (doi)
);

CREATE TABLE science_discoveries (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
name VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
significance TEXT,
discovery_date DATE,
patent_number VARCHAR(100),
patent_filing_date DATE,
patent_approval_date DATE,
is_commercialized BOOLEAN DEFAULT false,
commercial_value DECIMAL(15,2),
validation_status ENUM('theoretical', 'experimental', 'peer_reviewed', 'widely_accepted', 'controversial') DEFAULT 'theoretical',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_discovery_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_discovery_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE discovery_applications (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
first_used_year INT,
related_discovery_id BIGINT NOT NULL,
industry VARCHAR(100),
use_case TEXT,
benefits TEXT,
limitations TEXT,
adoption_level ENUM('theoretical', 'prototype', 'early_adoption', 'mainstream', 'declining') DEFAULT 'theoretical',
economic_impact DECIMAL(15,2),
societal_impact TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_application_discovery FOREIGN KEY (related_discovery_id) REFERENCES science_discoveries(id),
CONSTRAINT fk_application_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE science_methods (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
first_used_year INT,
technical_details TEXT,
methodology_type ENUM('qualitative', 'quantitative', 'mixed', 'experimental', 'observational', 'computational', 'theoretical') NOT NULL,
reliability_score DECIMAL(3,1) CHECK (reliability_score BETWEEN 0 AND 10),
validity_score DECIMAL(3,1) CHECK (validity_score BETWEEN 0 AND 10),
advantages TEXT,
limitations TEXT,
required_equipment TEXT,
required_expertise TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_method_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE work_methods (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
science_method_id BIGINT NOT NULL,
parameters TEXT,
application_details TEXT,
success_level ENUM('highly_successful', 'successful', 'neutral', 'problematic', 'unsuccessful') DEFAULT 'successful',
lessons_learned TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_work_method_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_work_method_method FOREIGN KEY (science_method_id) REFERENCES science_methods(id),
CONSTRAINT fk_work_method_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_work_method UNIQUE (science_work_id, science_method_id)
);

CREATE TABLE method_parameters (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT NOT NULL,
measurement_unit VARCHAR(50),
data_type ENUM('numeric', 'text', 'boolean', 'datetime', 'enumeration', 'other') NOT NULL,
possible_values TEXT, -- Возможные значения для перечислимых типов
default_value VARCHAR(255),
min_value VARCHAR(50),
max_value VARCHAR(50),
is_required BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
science_method_id BIGINT NOT NULL,
CONSTRAINT fk_parameter_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_parameter_method FOREIGN KEY (science_method_id) REFERENCES science_methods(id)
);

CREATE TABLE work_method_parameters (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
work_method_id BIGINT NOT NULL,
method_parameter_id BIGINT NOT NULL,
typical_range VARCHAR(100),
actual_value VARCHAR(255) NOT NULL,
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_work_param_work_method FOREIGN KEY (work_method_id) REFERENCES work_methods(id),
CONSTRAINT fk_work_param_parameter FOREIGN KEY (method_parameter_id) REFERENCES method_parameters(id),
CONSTRAINT fk_work_param_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_work_method_parameter UNIQUE (work_method_id, method_parameter_id)
);

CREATE TABLE science_equipment (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
first_developed_year INT,
technical_specs TEXT,
manufacturer VARCHAR(255),
model_number VARCHAR(100),
calibration_requirements TEXT,
maintenance_requirements TEXT,
estimated_cost DECIMAL(15,2),
lifespan_years INT,
power_requirements VARCHAR(100),
size_dimensions VARCHAR(100),
weight VARCHAR(50),
hazard_level ENUM('none', 'low', 'medium', 'high', 'extreme') DEFAULT 'none',
safety_precautions TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_equipment_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE work_equipment (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
science_equipment_id BIGINT NOT NULL,
usage_details TEXT,
start_date DATE,
end_date DATE,
performance_notes TEXT,
problems_encountered TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_work_equip_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_work_equip_equipment FOREIGN KEY (science_equipment_id) REFERENCES science_equipment(id),
CONSTRAINT fk_work_equip_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE products (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
sku VARCHAR(100) NOT NULL UNIQUE,
name VARCHAR(255) NOT NULL,
description TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
base_price DECIMAL(15,2) NOT NULL,
cost_price DECIMAL(15,2),
margin_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
CASE WHEN cost_price > 0 THEN ((base_price - cost_price) / cost_price) \* 100 ELSE 0 END
) STORED,
stock_quantity INT DEFAULT 0,
details JSON, -- Дополнительные характеристики
is_active BOOLEAN DEFAULT true,
product_category_id BIGINT,
product_line_id BIGINT,
min_stock_threshold INT DEFAULT 10,
max_stock_threshold INT DEFAULT 100,
reorder_quantity INT DEFAULT 50,
weight DECIMAL(10,2),
weight_unit VARCHAR(10) DEFAULT 'kg',
dimensions VARCHAR(50), -- Формат: ДxШxВ
is_digital BOOLEAN DEFAULT false,
is_featured BOOLEAN DEFAULT false,
tax_rate_id BIGINT,
warranty_period INT, -- Период гарантии в месяцах
manufacturer_id BIGINT,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_product_category FOREIGN KEY (product_category_id) REFERENCES product_categories(id),
CONSTRAINT fk_product_line FOREIGN KEY (product_line_id) REFERENCES product_lines(id),
CONSTRAINT fk_product_tax FOREIGN KEY (tax_rate_id) REFERENCES tax_rates(id),
CONSTRAINT fk_product_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES vendors(id),
CONSTRAINT fk_product_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE product_categories (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
parent_category_id BIGINT,
is_active BOOLEAN DEFAULT true,
display_order INT DEFAULT 0,
icon_url VARCHAR(255),
slug VARCHAR(100) NOT NULL UNIQUE,
meta_title VARCHAR(255),
meta_description TEXT,
meta_keywords TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_category_parent FOREIGN KEY (parent_category_id) REFERENCES product_categories(id),
CONSTRAINT fk_category_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE product_lines (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
attributes JSON,
brand_id BIGINT,
launch_date DATE,
end_of_life_date DATE,
status ENUM('planning', 'active', 'deprecated', 'discontinued') DEFAULT 'planning',
target_audience_id BIGINT,
positioning TEXT,
competitive_advantage TEXT,
pricing_strategy TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_line_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
CONSTRAINT fk_line_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_line_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE technologies (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(255) NOT NULL,
description TEXT NOT NULL,
area_id BIGINT, -- Связь с технической областью
maturity_level DECIMAL(3,1) CHECK (maturity_level BETWEEN 0 AND 9), -- TRL (Technology Readiness Level)
development_status ENUM('concept', 'research', 'prototype', 'development', 'production', 'mature', 'obsolete') DEFAULT 'concept',
first_appeared_year INT,
inventor VARCHAR(255),
patent_status ENUM('none', 'pending', 'granted', 'expired', 'public_domain') DEFAULT 'none',
patent_number VARCHAR(100),
license_type VARCHAR(100),
open_source BOOLEAN DEFAULT false,
github_url VARCHAR(255),
documentation_url VARCHAR(255),
use_cases TEXT,
limitations TEXT,
alternatives TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_technology_area FOREIGN KEY (area_id) REFERENCES technical_areas(id),
CONSTRAINT fk_technology_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE technology_trends (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
technology_id BIGINT NOT NULL,
trend_date DATE NOT NULL,
maturity_level DECIMAL(3,1) CHECK (maturity_level BETWEEN 0 AND 9),
adoption_rate DECIMAL(5,2) CHECK (adoption_rate BETWEEN 0 AND 100),
investment_level DECIMAL(5,2) CHECK (investment_level BETWEEN 0 AND 100),
trend_analysis TEXT,
data_source VARCHAR(255),
market_size DECIMAL(15,2),
growth_rate DECIMAL(5,2),
key_players TEXT,
geographic_distribution JSON,
industry_adoption JSON,
future_projection TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_trend_technology FOREIGN KEY (technology_id) REFERENCES technologies(id),
CONSTRAINT fk_trend_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_technology_date UNIQUE (technology_id, trend_date)
);

CREATE TABLE software_projects (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
project_code VARCHAR(50) NOT NULL UNIQUE,
start_date DATE NOT NULL,
planned_end_date DATE,
actual_end_date DATE,
status ENUM('planning', 'development', 'testing', 'deployment', 'maintenance', 'completed', 'cancelled') DEFAULT 'planning',
repository_url VARCHAR(255),
project_manager_user_id BIGINT,
technical_lead_user_id BIGINT,
methodology ENUM('waterfall', 'agile', 'scrum', 'kanban', 'hybrid', 'other') DEFAULT 'agile',
estimated_budget DECIMAL(15,2),
actual_budget DECIMAL(15,2) DEFAULT 0,
client_id BIGINT, -- Внешний ключ к клиентам/контактам
primary_technology VARCHAR(100),
system_requirements TEXT,
success_criteria TEXT,
risk_assessment TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_software_project_manager FOREIGN KEY (project_manager_user_id) REFERENCES users(id),
CONSTRAINT fk_software_tech_lead FOREIGN KEY (technical_lead_user_id) REFERENCES users(id),
CONSTRAINT fk_software_client FOREIGN KEY (client_id) REFERENCES contacts(id),
CONSTRAINT fk_software_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE software_releases (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
software_project_id BIGINT NOT NULL,
version VARCHAR(50) NOT NULL,
release_type ENUM('major', 'minor', 'patch', 'alpha', 'beta', 'rc') NOT NULL,
release_date TIMESTAMP,
release_notes TEXT,
changelog TEXT,
build_number VARCHAR(50),
git_commit_hash VARCHAR(100),
artifacts_url VARCHAR(255),
documentation_url VARCHAR(255),
status ENUM('planned', 'development', 'testing', 'released', 'deprecated') DEFAULT 'planned',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_release_project FOREIGN KEY (software_project_id) REFERENCES software_projects(id),
CONSTRAINT fk_release_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_project_version UNIQUE (software_project_id, version)
);

CREATE TABLE software_features (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
software_project_id BIGINT NOT NULL,
name VARCHAR(100) NOT NULL,
description TEXT,
priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
complexity ENUM('simple', 'moderate', 'complex', 'very_complex') DEFAULT 'moderate',
estimated_effort DECIMAL(10,2), -- В человеко-днях
actual_effort DECIMAL(10,2),
status ENUM('backlog', 'planning', 'development', 'testing', 'completed', 'cancelled') DEFAULT 'backlog',
target_release_id BIGINT,
actual_release_id BIGINT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
assigned_to_user_id BIGINT,
CONSTRAINT fk_feature_project FOREIGN KEY (software_project_id) REFERENCES software_projects(id),
CONSTRAINT fk_feature_target FOREIGN KEY (target_release_id) REFERENCES software_releases(id),
CONSTRAINT fk_feature_actual FOREIGN KEY (actual_release_id) REFERENCES software_releases(id),
CONSTRAINT fk_feature_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_feature_assignee FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
);

CREATE TABLE api_services (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
base_url VARCHAR(255) NOT NULL,
api_version VARCHAR(20) NOT NULL,
documentation_url VARCHAR(255),
swagger_url VARCHAR(255),
authentication_type ENUM('none', 'api_key', 'oauth2', 'jwt', 'basic', 'other') DEFAULT 'api_key',
status ENUM('development', 'testing', 'production', 'deprecated', 'retired') DEFAULT 'development',
rate_limit INT,
responsible_user_id BIGINT,
software_project_id BIGINT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_api_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id),
CONSTRAINT fk_api_project FOREIGN KEY (software_project_id) REFERENCES software_projects(id),
CONSTRAINT fk_api_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE api_endpoints (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
api_service_id BIGINT NOT NULL,
name VARCHAR(100) NOT NULL,
path VARCHAR(255) NOT NULL,
http_method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD') NOT NULL,
description TEXT,
request_parameters JSON,
request_body_schema JSON,
response_schema JSON,
example_request TEXT,
example_response TEXT,
status_codes TEXT, -- Возможные коды статуса и их описание
is_authenticated BOOLEAN DEFAULT true,
rate_limit INT,
cache_ttl INT, -- Время жизни кеша в секундах
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_endpoint_service FOREIGN KEY (api_service_id) REFERENCES api_services(id),
CONSTRAINT fk_endpoint_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_service_path_method UNIQUE (api_service_id, path, http_method)
);

CREATE TABLE data_models (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
schema_definition JSON, -- JSON Schema или подобное определение модели
database_table VARCHAR(100),
software_project_id BIGINT,
version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
status ENUM('draft', 'review', 'approved', 'active', 'deprecated') DEFAULT 'draft',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
responsible_user_id BIGINT,
CONSTRAINT fk_model_project FOREIGN KEY (software_project_id) REFERENCES software_projects(id),
CONSTRAINT fk_model_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_model_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id)
);

CREATE TABLE integration_points (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
source_system VARCHAR(100) NOT NULL,
target_system VARCHAR(100) NOT NULL,
integration_type ENUM('api', 'etl', 'webhook', 'message_queue', 'file_transfer', 'database', 'other') NOT NULL,
data_flow_direction ENUM('one_way', 'bidirectional') DEFAULT 'one_way',
frequency ENUM('real_time', 'hourly', 'daily', 'weekly', 'monthly', 'on_demand') DEFAULT 'real_time',
data_volume_estimate VARCHAR(50),
status ENUM('planning', 'development', 'testing', 'production', 'deprecated') DEFAULT 'planning',
security_notes TEXT,
error_handling_process TEXT,
monitoring_approach TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
responsible_user_id BIGINT,
CONSTRAINT fk_integration_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_integration_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id)
);

CREATE TABLE sciences (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL UNIQUE,
description TEXT,
parent_science_id BIGINT, -- Связь с родительской дисциплиной
classification_code VARCHAR(50),
research_areas TEXT,
historical_context TEXT,
key_theories TEXT,
methodological_approaches TEXT,
related_disciplines TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_science_parent FOREIGN KEY (parent_science_id) REFERENCES sciences(id),
CONSTRAINT fk_science_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE science_concepts (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
term VARCHAR(255) NOT NULL,
parent_concept_id BIGINT, -- Связь с родительским термином
definition TEXT NOT NULL,
science_id BIGINT NOT NULL, -- Связь с дисциплиной
etymology TEXT, -- Происхождение термина
historical_development TEXT,
usage_context TEXT,
alternative_definitions TEXT,
common_misconceptions TEXT,
see_also TEXT, -- Связанные термины
is_controversial BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_concept_parent FOREIGN KEY (parent_concept_id) REFERENCES science_concepts(id),
CONSTRAINT fk_concept_science FOREIGN KEY (science_id) REFERENCES sciences(id),
CONSTRAINT fk_concept_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_term_science UNIQUE (term, science_id)
);

CREATE TABLE concept_links (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
concept_from_id BIGINT NOT NULL, -- Исходный термин
concept_to_id BIGINT NOT NULL, -- Связанный термин
relation_type ENUM('synonym', 'antonym', 'broader', 'narrower', 'related', 'part_of', 'has_part', 'derived_from', 'causes', 'contradicts') NOT NULL,
description TEXT,
weight DECIMAL(3,2) DEFAULT 1.00, -- Сила связи от 0 до 1
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_link_from FOREIGN KEY (concept_from_id) REFERENCES science_concepts(id),
CONSTRAINT fk_link_to FOREIGN KEY (concept_to_id) REFERENCES science_concepts(id),
CONSTRAINT fk_link_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_concept_relation UNIQUE (concept_from_id, concept_to_id, relation_type)
);

CREATE TABLE concept_works (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_concept_id BIGINT NOT NULL, -- Связь с термином
science_work_id BIGINT NOT NULL, -- Связь с научной работой
is_primary BOOLEAN DEFAULT false, -- Является ли определение основным для термина
page VARCHAR(20), -- Страница в источнике
quote TEXT, -- Цитата с контекстом использования термина
contribution_type ENUM('definition', 'refinement', 'critique', 'application', 'extension') DEFAULT 'definition',
significance ENUM('groundbreaking', 'major', 'notable', 'minor') DEFAULT 'notable',
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_concept_work_concept FOREIGN KEY (science_concept_id) REFERENCES science_concepts(id),
CONSTRAINT fk_concept_work_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_concept_work_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE science_categories (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_id BIGINT NOT NULL, -- Связь с дисциплиной
name VARCHAR(100) NOT NULL,
parent_category_id BIGINT, -- Вышестоящая категория
description TEXT,
categorization_criteria TEXT,
examples TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_sci_category_science FOREIGN KEY (science_id) REFERENCES sciences(id),
CONSTRAINT fk_sci_category_parent FOREIGN KEY (parent_category_id) REFERENCES science_categories(id),
CONSTRAINT fk_sci_category_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE work_categories (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
science_category_id BIGINT NOT NULL,
relevance_score DECIMAL(3,2) DEFAULT 1.00, -- Степень соответствия категории
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_work_category_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_work_category_category FOREIGN KEY (science_category_id) REFERENCES science_categories(id),
CONSTRAINT fk_work_category_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_work_category UNIQUE (science_work_id, science_category_id)
);

CREATE TABLE analytics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
campaign_id BIGINT,
channel_id BIGINT,
stage_id BIGINT,
date DATE NOT NULL,
impressions BIGINT DEFAULT 0,
clicks BIGINT DEFAULT 0,
conversions INT DEFAULT 0,
revenue DECIMAL(15,2) DEFAULT 0,
expenses DECIMAL(15,2) DEFAULT 0,
romi DECIMAL(10,2) GENERATED ALWAYS AS (
CASE WHEN expenses > 0 THEN ((revenue - expenses) / expenses) \* 100 ELSE 0 END
) STORED,
additional_metrics JSON,
source VARCHAR(100), -- Источник данных
is_aggregated BOOLEAN DEFAULT false,
data_quality_score DECIMAL(3,2), -- Оценка качества данных
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_analytics_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_analytics_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_analytics_stage FOREIGN KEY (stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_analytics_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE kpi_definitions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
calculation_formula TEXT NOT NULL,
measurement_unit VARCHAR(50) NOT NULL,
target_values JSON, -- Целевые значения по периодам
frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annually') DEFAULT 'monthly',
data_source VARCHAR(255),
responsible_user_id BIGINT,
department_id BIGINT,
is_active BOOLEAN DEFAULT true,
weight DECIMAL(5,2) DEFAULT 1.00, -- Вес KPI в общей оценке
baseline_value DECIMAL(15,2), -- Базовое значение для сравнения
stretch_goal DECIMAL(15,2), -- Амбициозная цель
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_kpi_def_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id),
CONSTRAINT fk_kpi_def_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_kpi_def_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE kpi_results (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
kpi_id BIGINT NOT NULL,
date DATE NOT NULL,
actual_value DECIMAL(15,2) NOT NULL,
target_value DECIMAL(15,2) NOT NULL,
performance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
CASE WHEN target_value > 0 THEN (actual_value / target_value) \* 100 ELSE 0 END
) STORED,
status ENUM('exceeded', 'achieved', 'partially_achieved', 'not_achieved') NOT NULL,
notes TEXT,
data_source VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_kpi_result_kpi FOREIGN KEY (kpi_id) REFERENCES kpi_definitions(id),
CONSTRAINT fk_kpi_result_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_kpi_date UNIQUE (kpi_id, date)
);

CREATE TABLE organizational_learning (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
decision_id BIGINT, -- Связь с решением (может быть NULL)
lesson_type ENUM('success', 'failure', 'insight', 'process_improvement', 'best_practice', 'innovation') NOT NULL,
description TEXT NOT NULL,
source VARCHAR(255),
identified_date DATE NOT NULL,
action_taken TEXT,
knowledge_category VARCHAR(100),
project_id BIGINT,
department_id BIGINT,
impact_level ENUM('individual', 'team', 'department', 'organization', 'industry') DEFAULT 'team',
potential_benefit TEXT,
implementation_status ENUM('identified', 'planned', 'implemented', 'verified', 'standardized') DEFAULT 'identified',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_learning_decision FOREIGN KEY (decision_id) REFERENCES strategic_decisions(id),
CONSTRAINT fk_learning_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_learning_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_learning_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE scoring_criteria (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
description TEXT,
weight DECIMAL(5,2) DEFAULT 1.00,
evaluation_context ENUM('project', 'technology', 'research', 'product', 'personnel', 'vendor', 'generic') DEFAULT 'generic',
measurement_type ENUM('qualitative', 'quantitative', 'binary', 'scaled') DEFAULT 'scaled',
scale_min INT DEFAULT 0,
scale_max INT DEFAULT 10,
is_required BOOLEAN DEFAULT true,
formula TEXT, -- Если это расчетный критерий
data_source VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_criteria_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE scoring_rubrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
criteria_id BIGINT NOT NULL,
score_value INT NOT NULL,
description TEXT NOT NULL,
examples TEXT,
thresholds TEXT,
indicators TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_rubric_criteria FOREIGN KEY (criteria_id) REFERENCES scoring_criteria(id),
CONSTRAINT fk_rubric_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_criteria_score UNIQUE (criteria_id, score_value)
);

CREATE TABLE technical_parameters (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
measurement_unit VARCHAR(50) NOT NULL,
min_value DECIMAL(15,5),
max_value DECIMAL(15,5),
target_value DECIMAL(15,5),
tolerance DECIMAL(15,5),
description TEXT,
calculation_method TEXT,
measurement_interval VARCHAR(50),
measurement_tool VARCHAR(100),
is_critical BOOLEAN DEFAULT false,
area_id BIGINT, -- Связь с технической областью
product_category_id BIGINT, -- Может быть связан с категорией продукта
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_parameter_area FOREIGN KEY (area_id) REFERENCES technical_areas(id),
CONSTRAINT fk_parameter_category FOREIGN KEY (product_category_id) REFERENCES product_categories(id),
CONSTRAINT fk_parameter_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE evaluators (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
user_id BIGINT NOT NULL,
position VARCHAR(100) NOT NULL,
expertise_areas TEXT,
qualification VARCHAR(255),
certification TEXT,
years_of_experience INT,
evaluation_domains JSON, -- Области, в которых оценщик может проводить оценку
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_evaluator_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE evaluations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
evaluator_id BIGINT NOT NULL,
entity_type ENUM('project', 'technology', 'research', 'product', 'personnel', 'vendor', 'other') NOT NULL,
entity_id BIGINT NOT NULL,
evaluation_date TIMESTAMP NOT NULL,
overall_score DECIMAL(5,2),
scores JSON, -- Детальные оценки по критериям
strengths TEXT,
weaknesses TEXT,
recommendations TEXT,
status ENUM('draft', 'submitted', 'reviewed', 'approved', 'rejected') DEFAULT 'draft',
next_evaluation_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_evaluation_evaluator FOREIGN KEY (evaluator_id) REFERENCES evaluators(id)
);

CREATE TABLE performance_metrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
goal_id BIGINT, -- Связь со стратегической целью
project_id BIGINT,
metric_name VARCHAR(100) NOT NULL,
description TEXT,
measurement_method TEXT NOT NULL,
target_value VARCHAR(100) NOT NULL,
actual_value VARCHAR(100),
frequency VARCHAR(50) NOT NULL,
last_measurement DATE,
trend ENUM('improving', 'stable', 'declining', 'fluctuating', 'not_enough_data') DEFAULT 'not_enough_data',
historical_data JSON,
benchmark VARCHAR(100), -- Эталонное значение для сравнения
data_source VARCHAR(255),
responsible_user_id BIGINT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_perf_metric_goal FOREIGN KEY (goal_id) REFERENCES strategic_goals(id),
CONSTRAINT fk_perf_metric_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_perf_metric_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id),
CONSTRAINT fk_perf_metric_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE quality_standards (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
description TEXT,
standard_type ENUM('internal', 'industry', 'regulatory', 'international') NOT NULL,
version VARCHAR(50),
effective_date DATE NOT NULL,
expiration_date DATE,
compliance_requirements TEXT,
certification_process TEXT,
audit_frequency VARCHAR(100),
responsible_department_id BIGINT,
documentation_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_standard_department FOREIGN KEY (responsible_department_id) REFERENCES departments(id),
CONSTRAINT fk_standard_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE quality_assessments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
standard_id BIGINT NOT NULL,
entity_type ENUM('product', 'process', 'service', 'department', 'project', 'organization') NOT NULL,
entity_id BIGINT NOT NULL,
assessment_date DATE NOT NULL,
overall_score DECIMAL(5,2),
compliance_level ENUM('full', 'partial', 'minimal', 'non_compliant') NOT NULL,
findings TEXT,
corrective_actions TEXT,
next_assessment_date DATE,
assessor_id BIGINT NOT NULL, -- Связь с оценщиком
status ENUM('planned', 'in_progress', 'completed', 'verified') DEFAULT 'planned',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_assessment_standard FOREIGN KEY (standard_id) REFERENCES quality_standards(id),
CONSTRAINT fk_assessment_assessor FOREIGN KEY (assessor_id) REFERENCES evaluators(id),
CONSTRAINT fk_assessment_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE improvement_initiatives (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
initiative_type ENUM('process', 'product', 'service', 'organizational', 'cultural', 'technological') NOT NULL,
status ENUM('proposed', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'proposed',
priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
start_date DATE,
end_date DATE,
responsible_user_id BIGINT,
department_id BIGINT,
expected_benefits TEXT,
actual_benefits TEXT,
budget DECIMAL(15,2),
roi_estimate DECIMAL(5,2),
source ENUM('assessment', 'audit', 'customer_feedback', 'employee_suggestion', 'incident', 'benchmark') NOT NULL,
source_id BIGINT, -- ID источника (если применимо)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_initiative_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id),
CONSTRAINT fk_initiative_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_initiative_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE benchmarks (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
description TEXT,
benchmark_type ENUM('internal', 'industry', 'competitor', 'best_in_class') NOT NULL,
metric_id BIGINT, -- Связь с метрикой производительности
benchmark_value DECIMAL(15,2) NOT NULL,
benchmark_date DATE NOT NULL,
source VARCHAR(255),
confidence_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_benchmark_metric FOREIGN KEY (metric_id) REFERENCES performance_metrics(id),
CONSTRAINT fk_benchmark_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE customer_journeys (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
stage_id BIGINT NOT NULL, -- Этап воронки
entered_at TIMESTAMP NOT NULL,
exited_at TIMESTAMP,
status ENUM('active', 'completed', 'abandoned', 'on_hold') DEFAULT 'active',
duration_seconds INT GENERATED ALWAYS AS (
CASE WHEN exited_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, entered_at, exited_at) ELSE NULL END
) STORED,
entry_source VARCHAR(100), -- Источник входа на этап
exit_reason VARCHAR(100), -- Причина выхода с этапа
campaign_id BIGINT,
previous_stage_id BIGINT,
next_stage_id BIGINT,
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_journey_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_journey_stage FOREIGN KEY (stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_journey_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_journey_prev_stage FOREIGN KEY (previous_stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_journey_next_stage FOREIGN KEY (next_stage_id) REFERENCES funnel_stages(id)
);

CREATE TABLE social_media_metrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
channel_id BIGINT NOT NULL,
post_id BIGINT, -- Может быть NULL для общей статистики канала
date DATE NOT NULL,
impressions INT DEFAULT 0,
reach INT DEFAULT 0,
engagement INT DEFAULT 0,
clicks INT DEFAULT 0,
shares INT DEFAULT 0,
comments INT DEFAULT 0,
likes INT DEFAULT 0,
saves INT DEFAULT 0,
followers_gain INT DEFAULT 0,
followers_lost INT DEFAULT 0,
profile_visits INT DEFAULT 0,
ctr DECIMAL(5,2) DEFAULT 0,
cpc DECIMAL(10,2) DEFAULT 0,
cpm DECIMAL(10,2) DEFAULT 0,
additional_metrics JSON,
sentiment_score DECIMAL(3,2), -- Оценка настроения аудитории от -1 до 1
engagement_rate DECIMAL(5,2) GENERATED ALWAYS AS (
CASE WHEN impressions > 0 THEN (engagement / impressions) \* 100 ELSE 0 END
) STORED,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_social_metrics_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_social_metrics_post FOREIGN KEY (post_id) REFERENCES social_media_posts(id),
CONSTRAINT uk_channel_post_date UNIQUE (channel_id, post_id, date)
);

CREATE TABLE user_behaviors (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
landing_page_id BIGINT,
product_id BIGINT,
event_time TIMESTAMP NOT NULL,
event_type ENUM('page_view', 'scroll', 'click', 'hover', 'form_interaction', 'search', 'add_to_cart', 'purchase', 'abandon_cart', 'video_play', 'video_complete', 'download', 'registration', 'login', 'logout', 'share', 'custom') NOT NULL,
event_details JSON,
session_id VARCHAR(100),
referrer_url VARCHAR(255),
device_type VARCHAR(50),
browser VARCHAR(50),
os VARCHAR(50),
ip_address VARCHAR(45),
user_agent TEXT,
time_spent_seconds INT,
page_url VARCHAR(255),
utm_source VARCHAR(100),
utm_medium VARCHAR(100),
utm_campaign VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_behavior_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_behavior_page FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id),
CONSTRAINT fk_behavior_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE product_views (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
product_id BIGINT NOT NULL,
view_time TIMESTAMP NOT NULL,
view_duration_seconds INT NOT NULL,
source_page VARCHAR(255),
view_details JSON,
device_type VARCHAR(50),
session_id VARCHAR(100),
is_first_view BOOLEAN DEFAULT false,
is_return_view BOOLEAN DEFAULT false,
campaign_id BIGINT,
utm_source VARCHAR(100),
utm_medium VARCHAR(100),
utm_campaign VARCHAR(100),
channel_id BIGINT,
added_to_cart BOOLEAN DEFAULT false,
purchased BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_view_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_view_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_view_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_view_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id)
);

CREATE TABLE customers (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL UNIQUE,
company_id BIGINT, -- Связь с компанией (для B2B)
first_purchase_date DATE,
last_purchase_date DATE,
total_orders INT DEFAULT 0,
total_spent DECIMAL(15,2) DEFAULT 0,
average_order_value DECIMAL(15,2) GENERATED ALWAYS AS (
CASE WHEN total_orders > 0 THEN total_spent / total_orders ELSE 0 END
) STORED,
loyalty_points INT DEFAULT 0,
loyalty_tier VARCHAR(50),
customer_status ENUM('active', 'inactive', 'at_risk', 'churned', 'new') DEFAULT 'new',
lifetime_value DECIMAL(15,2) DEFAULT 0,
satisfaction_score DECIMAL(3,1),
nps_score INT,
preferred_payment_method VARCHAR(50),
preferred_shipping_method VARCHAR(50),
marketing_preferences JSON,
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_customer_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_customer_company FOREIGN KEY (company_id) REFERENCES companies(id),
CONSTRAINT fk_customer_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE competitors (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
country_of_registration VARCHAR(100),
primary_brand VARCHAR(100),
market_share DECIMAL(5,2),
strengths TEXT,
weaknesses TEXT,
opportunities TEXT,
threats TEXT,
founding_year INT,
headquarters VARCHAR(255),
employee_count INT,
annual_revenue DECIMAL(15,2),
revenue_currency VARCHAR(3) DEFAULT 'USD',
public_status ENUM('public', 'private', 'subsidiary', 'state_owned', 'unknown') DEFAULT 'unknown',
stock_symbol VARCHAR(20),
website_url VARCHAR(255),
social_media_presence JSON,
key_products JSON,
target_markets JSON,
last_analysis_date DATE,
competitive_position ENUM('leader', 'challenger', 'follower', 'niche') DEFAULT 'follower',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_competitor_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE external_environments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
analysis_date DATE NOT NULL,
political_factors TEXT,
economic_factors TEXT,
social_factors TEXT,
technological_factors TEXT,
environmental_factors TEXT,
legal_factors TEXT,
geographical_scope VARCHAR(100), -- Охват анализа (глобальный, региональный и т.д.)
time_horizon VARCHAR(50), -- Временной горизонт анализа
opportunity_score INT CHECK (opportunity_score BETWEEN 1 AND 10),
threat_score INT CHECK (threat_score BETWEEN 1 AND 10),
impact_matrix JSON, -- Матрица влияния факторов
action_recommendations TEXT,
next_review_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
department_id BIGINT,
CONSTRAINT fk_environment_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_environment_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE market_analyses (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
external_environment_id BIGINT,
market_size VARCHAR(100),
growth_rate VARCHAR(50),
market_trends TEXT,
customer_segments TEXT,
entry_barriers TEXT,
opportunities TEXT,
threats TEXT,
analysis_date DATE NOT NULL,
market_name VARCHAR(100) NOT NULL,
market_definition TEXT,
market_stage ENUM('emerging', 'growth', 'mature', 'declining') DEFAULT 'growth',
market_valuation DECIMAL(15,2),
valuation_currency VARCHAR(3) DEFAULT 'USD',
key_success_factors TEXT,
profit_potential ENUM('high', 'medium', 'low') DEFAULT 'medium',
technological_disruption_risk ENUM('high', 'medium', 'low') DEFAULT 'medium',
regulatory_outlook TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_market_environment FOREIGN KEY (external_environment_id) REFERENCES external_environments(id),
CONSTRAINT fk_market_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE competitor_analyses (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
market_analysis_id BIGINT NOT NULL,
competitor_id BIGINT NOT NULL,
market_share VARCHAR(50),
strengths TEXT,
weaknesses TEXT,
products_services TEXT,
pricing_strategy TEXT,
distribution_channels TEXT,
competitive_advantage TEXT,
marketing_approach TEXT,
customer_satisfaction_level VARCHAR(50),
talent_strength VARCHAR(50),
innovation_capacity VARCHAR(50),
financial_stability VARCHAR(50),
reaction_pattern TEXT, -- Как конкурент реагирует на рыночные изменения
strategic_direction TEXT,
threat_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
recommendation_for_response TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_competitor_analysis_market FOREIGN KEY (market_analysis_id) REFERENCES market_analyses(id),
CONSTRAINT fk_competitor_analysis_competitor FOREIGN KEY (competitor_id) REFERENCES competitors(id),
CONSTRAINT fk_competitor_analysis_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_analysis_competitor UNIQUE (market_analysis_id, competitor_id)
);

CREATE TABLE customer_feedback (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contact_id BIGINT NOT NULL,
feedback_type ENUM('survey', 'review', 'support_case', 'social_mention', 'direct', 'focus_group', 'usability_test') NOT NULL,
feedback_date TIMESTAMP NOT NULL,
feedback_content TEXT NOT NULL,
satisfaction_score DECIMAL(3,1),
nps_score INT,
sentiment_score DECIMAL(3,2), -- От -1 до 1
product_id BIGINT,
order_id BIGINT,
tags JSON, -- Ключевые темы/теги
status ENUM('new', 'reviewed', 'responded', 'actioned', 'closed') DEFAULT 'new',
priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
assigned_to_user_id BIGINT,
response_text TEXT,
responded_at TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
source_channel_id BIGINT,
is_public BOOLEAN DEFAULT false,
CONSTRAINT fk_feedback_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_feedback_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_feedback_order FOREIGN KEY (order_id) REFERENCES orders(id),
CONSTRAINT fk_feedback_user FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
CONSTRAINT fk_feedback_channel FOREIGN KEY (source_channel_id) REFERENCES communication_channels(id)
);

CREATE TABLE public_relations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
description TEXT,
pr_type ENUM('press_release', 'media_event', 'interview', 'press_conference', 'media_kit', 'news_article', 'opinion_piece', 'crisis_response', 'other') NOT NULL,
status ENUM('planned', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
start_date TIMESTAMP,
end_date TIMESTAMP,
target_audience JSON,
key_messages TEXT,
media_outlets JSON,
spokesperson_user_id BIGINT,
budget DECIMAL(15,2),
expected_reach INT,
actual_reach INT,
success_metrics TEXT,
outcome TEXT,
press_release_url VARCHAR(255),
media_coverage_urls JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
department_id BIGINT,
campaign_id BIGINT,
CONSTRAINT fk_pr_spokesperson FOREIGN KEY (spokesperson_user_id) REFERENCES users(id),
CONSTRAINT fk_pr_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_pr_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_pr_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE events (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
event_type ENUM('conference', 'webinar', 'workshop', 'exhibition', 'product_launch', 'networking', 'awards', 'other') NOT NULL,
status ENUM('planned', 'open_registration', 'sold_out', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
start_datetime TIMESTAMP NOT NULL,
end_datetime TIMESTAMP NOT NULL,
timezone VARCHAR(50) DEFAULT 'UTC',
location_type ENUM('physical', 'virtual', 'hybrid') NOT NULL,
location_details JSON,
capacity INT,
registered_attendees INT DEFAULT 0,
actual_attendees INT DEFAULT 0,
registration_url VARCHAR(255),
event_page_url VARCHAR(255),
target_audience JSON,
agenda JSON,
speakers JSON,
sponsors JSON,
budget DECIMAL(15,2),
revenue DECIMAL(15,2) DEFAULT 0,
success_metrics TEXT,
feedback_summary TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
department_id BIGINT,
campaign_id BIGINT,
CONSTRAINT fk_event_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_event_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_event_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE event_registrations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
event_id BIGINT NOT NULL,
contact_id BIGINT NOT NULL,
registration_date TIMESTAMP NOT NULL,
status ENUM('registered', 'confirmed', 'waitlisted', 'attended', 'no_show', 'cancelled') DEFAULT 'registered',
ticket_type VARCHAR(100),
ticket_price DECIMAL(15,2),
payment_status ENUM('pending', 'paid', 'refunded', 'waived') DEFAULT 'pending',
special_requirements TEXT,
check_in_time TIMESTAMP,
feedback_provided BOOLEAN DEFAULT false,
feedback_score DECIMAL(3,1),
feedback_comments TEXT,
utm_source VARCHAR(100),
utm_medium VARCHAR(100),
utm_campaign VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES events(id),
CONSTRAINT fk_registration_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT uk_event_contact UNIQUE (event_id, contact_id)
);

CREATE TABLE community_engagements (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
engagement_type ENUM('csr_initiative', 'charity_partnership', 'volunteer_program', 'educational_program', 'sustainability_initiative', 'community_support', 'other') NOT NULL,
status ENUM('planned', 'active', 'completed', 'ongoing', 'cancelled') DEFAULT 'planned',
start_date DATE,
end_date DATE,
location VARCHAR(255),
target_community VARCHAR(255),
social_impact_goals TEXT,
partners JSON,
budget DECIMAL(15,2),
actual_cost DECIMAL(15,2),
participants_count INT,
success_metrics TEXT,
outcomes TEXT,
media_coverage TEXT,
documentation_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
department_id BIGINT,
CONSTRAINT fk_engagement_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_engagement_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE content_calendars (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
description TEXT,
content_type ENUM('blog', 'social_post', 'email', 'video', 'podcast', 'whitepaper', 'case_study', 'newsletter', 'press_release', 'other') NOT NULL,
status ENUM('planned', 'in_creation', 'review', 'approved', 'published', 'cancelled') DEFAULT 'planned',
planned_publish_date DATE,
actual_publish_date DATE,
channel_id BIGINT,
campaign_id BIGINT,
target_audience_id BIGINT,
content_brief TEXT,
key_messages TEXT,
content_url VARCHAR(255),
content_metrics JSON, -- Показатели эффективности
assigned_to_user_id BIGINT,
reviewer_user_id BIGINT,
keywords TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_calendar_channel FOREIGN KEY (channel_id) REFERENCES communication_channels(id),
CONSTRAINT fk_calendar_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_calendar_audience FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id),
CONSTRAINT fk_calendar_assigned FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
CONSTRAINT fk_calendar_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES users(id),
CONSTRAINT fk_calendar_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE influencer_collaborations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
influencer_name VARCHAR(255) NOT NULL,
contact_id BIGINT, -- Если инфлюенсер есть в базе контактов
description TEXT,
collaboration_type ENUM('sponsored_post', 'affiliate', 'ambassador', 'product_review', 'content_creation', 'event_appearance', 'takeover', 'other') NOT NULL,
status ENUM('negotiation', 'contracted', 'active', 'completed', 'cancelled') DEFAULT 'negotiation',
start_date DATE,
end_date DATE,
platforms JSON, -- Платформы, на которых работает инфлюенсер
audience_size INT,
audience_demographics JSON,
engagement_rate DECIMAL(5,2),
contract_terms TEXT,
compensation DECIMAL(15,2),
compensation_type ENUM('monetary', 'product', 'hybrid', 'other') DEFAULT 'monetary',
campaign_id BIGINT,
product_id BIGINT,
content_brief TEXT,
deliverables TEXT,
published_content_urls JSON,
performance_metrics JSON,
roi DECIMAL(5,2),
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_influencer_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
CONSTRAINT fk_influencer_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
CONSTRAINT fk_influencer_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_influencer_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE audience_segmentation_analyses (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
analysis_date DATE NOT NULL,
data_source VARCHAR(255),
methodology TEXT,
segmentation_criteria JSON,
identified_segments JSON,
segment_sizes JSON,
segment_characteristics JSON,
primary_segment_id BIGINT, -- Приоритетный сегмент
opportunities TEXT,
recommendations TEXT,
next_steps TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_segmentation_primary FOREIGN KEY (primary_segment_id) REFERENCES market_segments(id),
CONSTRAINT fk_segmentation_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE brand_health_metrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
brand_id BIGINT NOT NULL,
measurement_date DATE NOT NULL,
awareness_score DECIMAL(5,2),
consideration_score DECIMAL(5,2),
preference_score DECIMAL(5,2),
satisfaction_score DECIMAL(5,2),
loyalty_score DECIMAL(5,2),
nps_score DECIMAL(5,2),
brand_value_estimate DECIMAL(15,2),
market_share DECIMAL(5,2),
sentiment_score DECIMAL(3,2), -- От -1 до 1
social_mentions INT,
share_of_voice DECIMAL(5,2),
reputation_score DECIMAL(5,2),
survey_sample_size INT,
methodology TEXT,
insights TEXT,
action_items TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_health_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
CONSTRAINT fk_health_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_brand_date UNIQUE (brand_id, measurement_date)
);

CREATE TABLE relevance_matrices (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT NOT NULL,
goal_id BIGINT NOT NULL,
direct_relevance DECIMAL(5,2) CHECK (direct_relevance BETWEEN 0 AND 100),
indirect_relevance DECIMAL(5,2) CHECK (indirect_relevance BETWEEN 0 AND 100),
time_relevance DECIMAL(5,2) CHECK (time_relevance BETWEEN 0 AND 100),
combined_relevance DECIMAL(5,2) GENERATED ALWAYS AS (
(direct_relevance _ 0.6) + (indirect_relevance _ 0.3) + (time_relevance \* 0.1)
) STORED,
justification TEXT,
evaluator_user_id BIGINT NOT NULL,
evaluation_date DATE NOT NULL,
status ENUM('draft', 'reviewed', 'approved', 'deprecated') DEFAULT 'draft',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_relevance_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_relevance_goal FOREIGN KEY (goal_id) REFERENCES strategic_goals(id),
CONSTRAINT fk_relevance_evaluator FOREIGN KEY (evaluator_user_id) REFERENCES users(id),
CONSTRAINT uk_project_goal_relevance UNIQUE (project_id, goal_id)
);

CREATE TABLE priority_calculation_logs (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT NOT NULL,
calculation_date DATE NOT NULL,
technical_score DECIMAL(5,2) NOT NULL,
relevance_score DECIMAL(5,2) NOT NULL,
resource_availability_score DECIMAL(5,2),
risk_score DECIMAL(5,2),
cost_benefit_score DECIMAL(5,2),
composite_priority_score DECIMAL(5,2) NOT NULL,
calculation_method TEXT,
weightings JSON, -- Веса отдельных компонентов
calculated_by_user_id BIGINT NOT NULL,
priority_rank INT, -- Ранг среди всех проектов
status ENUM('draft', 'reviewed', 'approved', 'superseded') DEFAULT 'draft',
comments TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_priority_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_priority_calculator FOREIGN KEY (calculated_by_user_id) REFERENCES users(id)
);

CREATE TABLE project_organizations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT NOT NULL,
company_id BIGINT NOT NULL,
role ENUM('lead', 'partner', 'supplier', 'consultant', 'sponsor', 'regulator', 'customer', 'other') NOT NULL,
involvement_start DATE NOT NULL,
involvement_end DATE,
contract_id BIGINT, -- Ссылка на контракт (если есть)
primary_contact_id BIGINT, -- Ссылка на основной контакт
responsibilities TEXT,
deliverables TEXT,
financial_contribution DECIMAL(15,2),
status ENUM('active', 'inactive', 'pending', 'completed') DEFAULT 'active',
performance_rating DECIMAL(3,1),
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_proj_org_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_proj_org_company FOREIGN KEY (company_id) REFERENCES companies(id),
CONSTRAINT fk_proj_org_contract FOREIGN KEY (contract_id) REFERENCES contracts(id),
CONSTRAINT fk_proj_org_contact FOREIGN KEY (primary_contact_id) REFERENCES contacts(id),
CONSTRAINT fk_proj_org_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_project_company_role UNIQUE (project_id, company_id, role)
);

CREATE TABLE contracts (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
contract_number VARCHAR(100) NOT NULL UNIQUE,
title VARCHAR(255) NOT NULL,
description TEXT,
contract_type ENUM('service', 'product', 'employment', 'partnership', 'license', 'nda', 'msa', 'sla', 'other') NOT NULL,
status ENUM('draft', 'review', 'approved', 'signed', 'active', 'completed', 'terminated', 'expired') DEFAULT 'draft',
company_id BIGINT NOT NULL, -- Наша компания
counterparty_id BIGINT NOT NULL, -- Контрагент
start_date DATE NOT NULL,
end_date DATE,
value DECIMAL(15,2),
currency VARCHAR(3) DEFAULT 'USD',
auto_renewal BOOLEAN DEFAULT false,
renewal_terms TEXT,
termination_terms TEXT,
payment_terms TEXT,
legal_jurisdiction VARCHAR(100),
contract_document_url VARCHAR(255),
signed_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
responsible_user_id BIGINT NOT NULL,
legal_reviewer_user_id BIGINT,
CONSTRAINT fk_contract_company FOREIGN KEY (company_id) REFERENCES companies(id),
CONSTRAINT fk_contract_counterparty FOREIGN KEY (counterparty_id) REFERENCES companies(id),
CONSTRAINT fk_contract_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT fk_contract_responsible FOREIGN KEY (responsible_user_id) REFERENCES users(id),
CONSTRAINT fk_contract_legal FOREIGN KEY (legal_reviewer_user_id) REFERENCES users(id)
);

CREATE TABLE project_statuses (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
description TEXT,
sequence_order INT NOT NULL,
color VARCHAR(20), -- Цвет для визуализации
icon VARCHAR(50), -- Иконка для визуализации
is_active BOOLEAN DEFAULT true,
requires_approval BOOLEAN DEFAULT false,
approver_role_id BIGINT, -- Роль, которая может утвердить этот статус
next_possible_statuses JSON, -- Список возможных следующих статусов
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_status_role FOREIGN KEY (approver_role_id) REFERENCES roles(id),
CONSTRAINT fk_status_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE project_status_history (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT NOT NULL,
status_id BIGINT NOT NULL,
changed_at TIMESTAMP NOT NULL,
changed_by_user_id BIGINT NOT NULL,
reason TEXT,
comments TEXT,
duration_in_status INT GENERATED ALWAYS AS (
TIMESTAMPDIFF(DAY, changed_at,
(SELECT MIN(changed_at) FROM project_status_history
WHERE project_id = project_status_history.project_id
AND changed_at > project_status_history.changed_at))
) STORED,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_status_hist_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_status_hist_status FOREIGN KEY (status_id) REFERENCES project_statuses(id),
CONSTRAINT fk_status_hist_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE historical_patterns (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(255) NOT NULL,
pattern_type ENUM('success', 'failure', 'risk', 'opportunity', 'process', 'behavioral', 'other') NOT NULL,
description TEXT,
success_rate DECIMAL(5,2) CHECK (success_rate BETWEEN 0 AND 100),
identified_by_user_id BIGINT NOT NULL,
identification_date DATE NOT NULL,
business_area VARCHAR(100),
recurrence_frequency VARCHAR(100),
impact_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
source_projects JSON, -- Ссылки на проекты, где был выявлен паттерн
contributing_factors TEXT,
recommended_actions TEXT,
evidence TEXT,
verification_status ENUM('hypothetical', 'observed', 'verified', 'validated') DEFAULT 'observed',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_pattern_identifier FOREIGN KEY (identified_by_user_id) REFERENCES users(id)
);

CREATE TABLE decision_records (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT, -- Может быть NULL для решений, не связанных с проектами
decision_date DATE NOT NULL,
decision_type ENUM('strategic', 'tactical', 'operational', 'technical', 'financial', 'personnel', 'other') NOT NULL,
decision_summary TEXT NOT NULL,
detailed_description TEXT,
decision_maker_id BIGINT NOT NULL,
context TEXT,
alternatives_considered TEXT,
decision_criteria TEXT,
impact TEXT,
risks TEXT,
implementation_plan TEXT,
status ENUM('proposed', 'approved', 'implemented', 'reversed', 'superseded') DEFAULT 'proposed',
related_decisions JSON, -- Ссылки на связанные решения
tags JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_decision_rec_project FOREIGN KEY (project_id) REFERENCES projects(id),
CONSTRAINT fk_decision_rec_maker FOREIGN KEY (decision_maker_id) REFERENCES users(id),
CONSTRAINT fk_decision_rec_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE policy_documents (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
document_number VARCHAR(100) NOT NULL UNIQUE,
title VARCHAR(255) NOT NULL,
document_type ENUM('policy', 'procedure', 'standard', 'guideline', 'regulation', 'instruction', 'manual', 'other') NOT NULL,
description TEXT,
content TEXT,
version VARCHAR(20) NOT NULL,
effective_date DATE NOT NULL,
expiry_date DATE,
review_frequency VARCHAR(100),
next_review_date DATE,
status ENUM('draft', 'review', 'approved', 'published', 'superseded', 'archived') DEFAULT 'draft',
department_id BIGINT,
owner_user_id BIGINT NOT NULL,
approver_user_id BIGINT,
approved_date DATE,
document_url VARCHAR(255),
related_policies JSON,
compliance_requirements TEXT,
audience VARCHAR(255),
tags JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_policy_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_policy_owner FOREIGN KEY (owner_user_id) REFERENCES users(id),
CONSTRAINT fk_policy_approver FOREIGN KEY (approver_user_id) REFERENCES users(id),
CONSTRAINT fk_policy_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE org_structure (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
department_id BIGINT NOT NULL,
parent_department_id BIGINT,
manager_user_id BIGINT,
hierarchy_level INT NOT NULL,
left_boundary INT NOT NULL, -- Для nested set модели
right_boundary INT NOT NULL, -- Для nested set модели
effective_date DATE NOT NULL,
end_date DATE,
status ENUM('planned', 'active', 'historical') DEFAULT 'active',
direct_reports_count INT DEFAULT 0,
total_headcount INT DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_org_department FOREIGN KEY (department_id) REFERENCES departments(id),
CONSTRAINT fk_org_parent FOREIGN KEY (parent_department_id) REFERENCES departments(id),
CONSTRAINT fk_org_manager FOREIGN KEY (manager_user_id) REFERENCES users(id),
CONSTRAINT fk_org_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_department_effective_date UNIQUE (department_id, effective_date)
);

CREATE TABLE governance_committees (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
code VARCHAR(50) NOT NULL UNIQUE,
description TEXT,
committee_type ENUM('board', 'executive', 'audit', 'risk', 'compensation', 'technology', 'project', 'other') NOT NULL,
purpose TEXT NOT NULL,
authority_level TEXT,
meeting_frequency VARCHAR(100),
charter_document_url VARCHAR(255),
chair_user_id BIGINT NOT NULL,
secretary_user_id BIGINT,
parent_committee_id BIGINT,
established_date DATE NOT NULL,
disbanded_date DATE,
status ENUM('active', 'inactive', 'planned', 'disbanded') DEFAULT 'active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_committee_chair FOREIGN KEY (chair_user_id) REFERENCES users(id),
CONSTRAINT fk_committee_secretary FOREIGN KEY (secretary_user_id) REFERENCES users(id),
CONSTRAINT fk_committee_parent FOREIGN KEY (parent_committee_id) REFERENCES governance_committees(id),
CONSTRAINT fk_committee_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE committee_members (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
committee_id BIGINT NOT NULL,
user_id BIGINT NOT NULL,
role VARCHAR(100),
start_date DATE NOT NULL,
end_date DATE,
is_voting_member BOOLEAN DEFAULT true,
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_member_committee FOREIGN KEY (committee_id) REFERENCES governance_committees(id),
CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id),
CONSTRAINT fk_member_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_committee_user UNIQUE (committee_id, user_id)
);

CREATE TABLE pattern_goal_trees (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
version VARCHAR(50) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
CONSTRAINT fk_goal_tree_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE pattern_tree_elements (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
goal_tree_id BIGINT NOT NULL,
parent_element_id BIGINT,
element_name VARCHAR(255) NOT NULL,
element_description TEXT,
element_level INT NOT NULL,
left_boundary INT NOT NULL,
right_boundary INT NOT NULL,
importance_coefficient DECIMAL(5,2),
technical_success_probability DECIMAL(5,2),
readiness_level DECIMAL(3,1),
status ENUM('proposed', 'evaluated', 'approved', 'implemented', 'deprecated') DEFAULT 'proposed',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_element_goal_tree FOREIGN KEY (goal_tree_id) REFERENCES pattern_goal_trees(id),
CONSTRAINT fk_element_parent FOREIGN KEY (parent_element_id) REFERENCES pattern_tree_elements(id)
);

CREATE TABLE pattern_expert_evaluations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
element_id BIGINT NOT NULL,
expert_id BIGINT NOT NULL,
evaluation_round INT NOT NULL,
evaluation_method ENUM('simple', 'delphi', 'consensus') NOT NULL,
importance_score DECIMAL(5,2),
feasibility_score DECIMAL(5,2),
time_estimate INT, -- в месяцах
cost_estimate DECIMAL(15,2),
comments TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_evaluation_element FOREIGN KEY (element_id) REFERENCES pattern_tree_elements(id),
CONSTRAINT fk_evaluation_expert FOREIGN KEY (expert_id) REFERENCES evaluators(id),
CONSTRAINT uk_element_expert_round UNIQUE (element_id, expert_id, evaluation_round)
);

CREATE TABLE pattern_resource_allocations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
goal_tree_id BIGINT NOT NULL,
budget_period VARCHAR(50) NOT NULL,
total_budget DECIMAL(15,2) NOT NULL,
allocation_status ENUM('draft', 'proposed', 'approved', 'implemented') DEFAULT 'draft',
allocation_date DATE NOT NULL,
approved_by_user_id BIGINT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_allocation_goal_tree FOREIGN KEY (goal_tree_id) REFERENCES pattern_goal_trees(id),
CONSTRAINT fk_allocation_approver FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE pattern_element_allocations (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
resource_allocation_id BIGINT NOT NULL,
element_id BIGINT NOT NULL,
allocated_amount DECIMAL(15,2) NOT NULL,
priority_score DECIMAL(5,2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_element_allocation_resource FOREIGN KEY (resource_allocation_id) REFERENCES pattern_resource_allocations(id),
CONSTRAINT fk_element_allocation_element FOREIGN KEY (element_id) REFERENCES pattern_tree_elements(id),
CONSTRAINT uk_allocation_element UNIQUE (resource_allocation_id, element_id)
);

CREATE TABLE brand_dimension_strategies (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
brand_id BIGINT NOT NULL,
dimension_type ENUM('functional', 'social', 'mental', 'spiritual') NOT NULL,
strategy_title VARCHAR(255) NOT NULL,
strategy_description TEXT,
key_metrics JSON,
implementation_plan TEXT,
current_status ENUM('planned', 'in_progress', 'implemented', 'evaluating', 'optimizing') DEFAULT 'planned',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_dimension_strategy_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
CONSTRAINT fk_dimension_strategy_user FOREIGN KEY (created_by_user_id) REFERENCES users(id),
CONSTRAINT uk_brand_dimension UNIQUE (brand_id, dimension_type)
);

CREATE TABLE brand_dimension_touchpoints (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
brand_dimension_strategy_id BIGINT NOT NULL,
touchpoint_name VARCHAR(100) NOT NULL,
touchpoint_type ENUM('website', 'product', 'service', 'communication', 'staff', 'environment', 'social_media', 'other') NOT NULL,
implementation_details TEXT,
status ENUM('planned', 'active', 'inactive') DEFAULT 'planned',
metrics_and_kpis JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_touchpoint_dimension FOREIGN KEY (brand_dimension_strategy_id) REFERENCES brand_dimension_strategies(id)
);

CREATE TABLE neurophotinic_products (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
product_id BIGINT NOT NULL,
neural_entrainment_type ENUM('audio', 'visual', 'combined', 'other') NOT NULL,
frequency_range VARCHAR(100),
therapeutic_purpose TEXT,
clinical_validation_status ENUM('theoretical', 'laboratory', 'clinical_trials', 'validated', 'approved') DEFAULT 'theoretical',
safety_level ENUM('general_public', 'supervised_use', 'professional_only', 'research_only') NOT NULL,
contraindications TEXT,
recommended_usage_protocol TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_neurophotinic_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_neurophotinic_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE neural_entrainment_sessions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
neurophotinic_product_id BIGINT NOT NULL,
protocol_name VARCHAR(255) NOT NULL,
session_duration INT NOT NULL, -- в минутах
frequency_pattern TEXT,
intensity_profile TEXT,
target_brain_state TEXT,
expected_outcomes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_session_product FOREIGN KEY (neurophotinic_product_id) REFERENCES neurophotinic_products(id)
);
Добавить структуру для автоматизации денежного конвейера:
CREATE TABLE payment_gateways (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
gateway_name VARCHAR(100) NOT NULL,
gateway_type ENUM('acquiring', 'payment_processor', 'wallet', 'cryptocurrency', 'other') NOT NULL,
api_credentials JSON,
commission_structure JSON,
status ENUM('active', 'inactive', 'testing', 'deprecated') DEFAULT 'testing',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE payment_flows (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
flow_name VARCHAR(255) NOT NULL,
product_id BIGINT,
funnel_stage_id BIGINT,
payment_gateway_id BIGINT NOT NULL,
payment_type ENUM('one_time', 'subscription', 'installment', 'freemium', 'donation') NOT NULL,
amount_strategy ENUM('fixed', 'dynamic', 'tiered', 'pay_what_you_want') NOT NULL,
default_amount DECIMAL(15,2),
currency VARCHAR(3) DEFAULT 'RUB',
pricing_rules JSON,
success_redirect_url VARCHAR(255),
failure_redirect_url VARCHAR(255),
notification_settings JSON,
analytics_tracking_code VARCHAR(255),
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_flow_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_flow_stage FOREIGN KEY (funnel_stage_id) REFERENCES funnel_stages(id),
CONSTRAINT fk_flow_gateway FOREIGN KEY (payment_gateway_id) REFERENCES payment_gateways(id)
);

CREATE TABLE electronic_money_pipeline (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
start_trigger_type ENUM('user_action', 'scheduled', 'external_event', 'manual', 'payment_completion') NOT NULL,
trigger_configuration JSON,
currency_flow_path JSON, -- Структурированное описание движения средств
revenue_distribution_rules JSON, -- Правила распределения доходов
tax_handling_strategy TEXT,
fee_handling_strategy TEXT,
accounting_integration_details JSON,
status ENUM('draft', 'active', 'paused', 'archived') DEFAULT 'draft',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_pipeline_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE financial_pipelines (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
status ENUM('active', 'inactive', 'testing', 'archived') DEFAULT 'testing',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by_user_id BIGINT NOT NULL,
CONSTRAINT fk_pipeline_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE TABLE pipeline_stages (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
stage_name VARCHAR(100) NOT NULL,
stage_order INT NOT NULL,
stage_type ENUM('revenue_collection', 'fund_allocation', 'cost_coverage', 'profit_distribution', 'reinvestment') NOT NULL,
processing_rules JSON NOT NULL, -- Правила обработки финансов на данном этапе
approval_requirements JSON, -- Требования к подтверждению операций
automation_level ENUM('manual', 'semi_automated', 'fully_automated') DEFAULT 'semi_automated',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_stage_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id),
CONSTRAINT uk_pipeline_stage_order UNIQUE (pipeline_id, stage_order)
);

CREATE TABLE revenue_streams (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
stream_name VARCHAR(100) NOT NULL,
source_type ENUM('product_sales', 'subscriptions', 'licensing', 'grants', 'investments', 'royalties', 'consulting', 'other') NOT NULL,
product_id BIGINT,
payment_gateway_id BIGINT,
revenue_allocation_rules JSON, -- Правила распределения доходов
taxation_rules JSON, -- Правила налогообложения
accounting_codes JSON, -- Бухгалтерские коды для учета
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_stream_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id),
CONSTRAINT fk_stream_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_stream_gateway FOREIGN KEY (payment_gateway_id) REFERENCES payment_gateways(id)
);

CREATE TABLE cost_centers (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
center_name VARCHAR(100) NOT NULL,
center_type ENUM('research', 'development', 'production', 'marketing', 'sales', 'administration', 'infrastructure', 'other') NOT NULL,
department_id BIGINT,
budget_allocation_percentage DECIMAL(5,2) DEFAULT 0,
dynamic_allocation_rules JSON, -- Правила динамического распределения бюджета
minimum_funding DECIMAL(15,2), -- Минимальное необходимое финансирование
optimal_funding DECIMAL(15,2), -- Оптимальное финансирование
expense_categories JSON, -- Категории расходов
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_center_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id),
CONSTRAINT fk_center_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE investment_pools (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
pool_name VARCHAR(100) NOT NULL,
purpose_type ENUM('r_and_d', 'equipment', 'marketing', 'expansion', 'reserve', 'innovation', 'other') NOT NULL,
allocation_percentage DECIMAL(5,2) DEFAULT 0,
target_amount DECIMAL(15,2),
current_amount DECIMAL(15,2) DEFAULT 0,
investment_criteria JSON, -- Критерии для инвестирования средств
roi_expectations JSON, -- Ожидаемая отдача от инвестиций
risk_profile ENUM('low', 'medium', 'high') DEFAULT 'medium',
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_pool_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id)
);

CREATE TABLE pipeline_financial_transactions (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
stage_id BIGINT NOT NULL,
transaction_type ENUM('revenue', 'expense', 'transfer', 'allocation', 'reinvestment', 'distribution') NOT NULL,
amount DECIMAL(15,2) NOT NULL,
currency VARCHAR(3) DEFAULT 'RUB',
source_id BIGINT, -- ID источника средств (revenue_stream, cost_center, investment_pool)
source_type VARCHAR(50), -- Тип источника
destination_id BIGINT, -- ID получателя средств
destination_type VARCHAR(50), -- Тип получателя
transaction_date TIMESTAMP NOT NULL,
status ENUM('pending', 'processing', 'completed', 'failed', 'reversed') DEFAULT 'pending',
reference_number VARCHAR(100),
description TEXT,
metadata JSON, -- Дополнительные метаданные транзакции
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_transaction_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id),
CONSTRAINT fk_transaction_stage FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id)
);

CREATE TABLE financial_automation_rules (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
rule_name VARCHAR(100) NOT NULL,
trigger_type ENUM('schedule', 'threshold', 'event', 'manual', 'algorithm') NOT NULL,
trigger_conditions JSON, -- Условия срабатывания правила
actions JSON, -- Действия, выполняемые при срабатывании
priority INT DEFAULT 0, -- Приоритет правила
is_active BOOLEAN DEFAULT true,
last_triggered_at TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_rule_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id)
);

CREATE TABLE financial_metrics (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pipeline_id BIGINT NOT NULL,
metric_name VARCHAR(100) NOT NULL,
metric_type ENUM('revenue', 'cost', 'profit', 'roi', 'efficiency', 'velocity', 'distribution', 'other') NOT NULL,
calculation_formula TEXT,
measurement_unit VARCHAR(50),
target_value DECIMAL(15,2),
current_value DECIMAL(15,2),
measurement_period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annually') DEFAULT 'monthly',
last_updated TIMESTAMP,
visualization_settings JSON, -- Настройки для визуализации в дашборде
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_metric_pipeline FOREIGN KEY (pipeline_id) REFERENCES financial_pipelines(id)
);

CREATE TABLE monetization_models (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
model_name VARCHAR(100) NOT NULL,
description TEXT,
applicable_product_types JSON, -- Типы продуктов, к которым применима модель
revenue_mechanism TEXT, -- Механизм получения доходов
value_delivery_method TEXT, -- Способ доставки ценности клиенту
payment_structure JSON, -- Структура платежей
typical_metrics JSON, -- Типичные метрики эффективности
success_factors TEXT, -- Факторы успеха
risk_factors TEXT, -- Факторы риска
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_monetization_strategies (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
product_id BIGINT NOT NULL,
monetization_model_id BIGINT NOT NULL,
primary_revenue_stream_id BIGINT,
implementation_details TEXT,
pricing_strategy TEXT,
market_positioning TEXT,
customer_acquisition_cost DECIMAL(15,2),
expected_customer_lifetime_value DECIMAL(15,2),
payback_period INT, -- В месяцах
breakeven_point DECIMAL(15,2),
target_profit_margin DECIMAL(5,2),
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_product_monetization_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_product_monetization_model FOREIGN KEY (monetization_model_id) REFERENCES monetization_models(id),
CONSTRAINT fk_product_monetization_stream FOREIGN KEY (primary_revenue_stream_id) REFERENCES revenue_streams(id)
);

CREATE TABLE intellectual_property_assets (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
asset_name VARCHAR(255) NOT NULL,
asset_type ENUM('patent', 'copyright', 'trademark', 'trade_secret', 'know_how', 'database_right', 'other') NOT NULL,
reference_number VARCHAR(100), -- Номер патента, свидетельства и т.д.
jurisdiction VARCHAR(100), -- Юрисдикция регистрации
filing_date DATE,
grant_date DATE,
expiration_date DATE,
inventors JSON, -- Список изобретателей/авторов
owners JSON, -- Текущие владельцы прав
legal_status ENUM('pending', 'registered', 'granted', 'maintained', 'abandoned', 'expired', 'disputed') DEFAULT 'pending',
scope_of_protection TEXT, -- Объем правовой защиты
related_science_work_id BIGINT,
commercialization_status ENUM('not_commercialized', 'licensing', 'direct_use', 'joint_venture', 'spin_off', 'sale') DEFAULT 'not_commercialized',
estimated_value DECIMAL(15,2),
valuation_date DATE,
valuation_method VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_ip_science_work FOREIGN KEY (related_science_work_id) REFERENCES science_works(id)
);

CREATE TABLE licensing_agreements (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
ip_asset_id BIGINT NOT NULL,
licensee_id BIGINT NOT NULL, -- ID компании-лицензиата
agreement_type ENUM('exclusive', 'non_exclusive', 'sole', 'cross', 'sublicensable') NOT NULL,
territory VARCHAR(255), -- Территория действия
field_of_use TEXT, -- Область использования
start_date DATE NOT NULL,
end_date DATE,
royalty_type ENUM('percentage', 'fixed', 'minimum_guarantee', 'milestone', 'hybrid', 'other') NOT NULL,
royalty_terms JSON, -- Детали роялти
upfront_payment DECIMAL(15,2),
maintenance_fees JSON, -- Периодические платежи за поддержание
performance_obligations TEXT, -- Обязательства лицензиата
audit_rights TEXT, -- Права на аудит
termination_conditions TEXT, -- Условия расторжения
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_licensing_ip FOREIGN KEY (ip_asset_id) REFERENCES intellectual_property_assets(id),
CONSTRAINT fk_licensing_licensee FOREIGN KEY (licensee_id) REFERENCES companies(id)
);

CREATE TABLE commercialization_pathways (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
total_estimated_time INT, -- В месяцах
total_estimated_budget DECIMAL(15,2),
success_probability DECIMAL(5,2),
risk_assessment TEXT,
resource_requirements JSON,
critical_success_factors TEXT,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE commercialization_stages (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
pathway_id BIGINT NOT NULL,
stage_name VARCHAR(100) NOT NULL,
stage_order INT NOT NULL,
description TEXT,
expected_duration INT, -- В неделях
estimated_cost DECIMAL(15,2),
key_activities TEXT,
deliverables TEXT,
required_expertise JSON,
exit_criteria TEXT,
dependency_type ENUM('linear', 'flexible', 'milestone_based') DEFAULT 'linear',
dependency_conditions JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_stage_pathway FOREIGN KEY (pathway_id) REFERENCES commercialization_pathways(id),
CONSTRAINT uk_pathway_stage_order UNIQUE (pathway_id, stage_order)
);

CREATE TABLE commercialization_projects (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
science_work_id BIGINT NOT NULL,
pathway_id BIGINT NOT NULL,
project_name VARCHAR(255) NOT NULL,
project_manager_user_id BIGINT NOT NULL,
current_stage_id BIGINT,
start_date DATE NOT NULL,
planned_end_date DATE,
actual_end_date DATE,
status ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
progress_percentage DECIMAL(5,2) DEFAULT 0,
budget DECIMAL(15,2),
actual_spend DECIMAL(15,2) DEFAULT 0,
target_product_id BIGINT,
risks_and_challenges TEXT,
success_metrics JSON,
resource_allocation_plan JSON,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_comm_project_work FOREIGN KEY (science_work_id) REFERENCES science_works(id),
CONSTRAINT fk_comm_project_pathway FOREIGN KEY (pathway_id) REFERENCES commercialization_pathways(id),
CONSTRAINT fk_comm_project_manager FOREIGN KEY (project_manager_user_id) REFERENCES users(id),
CONSTRAINT fk_comm_project_stage FOREIGN KEY (current_stage_id) REFERENCES commercialization_stages(id),
CONSTRAINT fk_comm_project_product FOREIGN KEY (target_product_id) REFERENCES products(id)
);

CREATE TABLE stage_activities (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT NOT NULL,
stage_id BIGINT NOT NULL,
activity_name VARCHAR(100) NOT NULL,
description TEXT,
start_date DATE,
end_date DATE,
status ENUM('planned', 'in_progress', 'completed', 'blocked', 'cancelled') DEFAULT 'planned',
responsible_user_id BIGINT,
estimated_hours DECIMAL(8,2),
actual_hours DECIMAL(8,2) DEFAULT 0,
dependencies JSON, -- Зависимости от других активностей
output_deliverables TEXT,
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_activity_project FOREIGN KEY (project_id) REFERENCES commercialization_projects(id),
CONSTRAINT fk_activity_stage FOREIGN KEY (stage_id) REFERENCES commercialization_stages(id),
CONSTRAINT fk_activity_user FOREIGN KEY (responsible_user_id) REFERENCES users(id)
);

CREATE TABLE technology_readiness_assessments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
project_id BIGINT NOT NULL,
assessment_date DATE NOT NULL,
trl_level INT NOT NULL CHECK (trl_level BETWEEN 1 AND 9), -- Technology Readiness Level (1-9)
evidence TEXT, -- Доказательства достижения уровня
assessor_user_id BIGINT NOT NULL,
gaps_identified TEXT,
recommended_actions TEXT,
next_assessment_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_trl_project FOREIGN KEY (project_id) REFERENCES commercialization_projects(id),
CONSTRAINT fk_trl_assessor FOREIGN KEY (assessor_user_id) REFERENCES users(id)
);

CREATE TABLE pricing_strategies (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
strategy_name VARCHAR(100) NOT NULL,
description TEXT,
suitable_for_product_types JSON,
pricing_formula TEXT,
key_variables JSON,
advantages TEXT,
limitations TEXT,
market_conditions TEXT, -- При каких рыночных условиях эффективна
example_implementation TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product_pricing_models (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
product_id BIGINT NOT NULL,
pricing_strategy_id BIGINT NOT NULL,
base_price DECIMAL(15,2) NOT NULL,
currency VARCHAR(3) DEFAULT 'RUB',
price_components JSON, -- Структура компонентов цены
cost_breakdown JSON, -- Разбивка себестоимости
margin_percentage DECIMAL(5,2),
discount_policy JSON, -- Политика скидок
price_tiers JSON, -- Ценовые уровни (для многоуровневых моделей)
dynamic_pricing_rules JSON, -- Правила динамического ценообразования
price_review_frequency VARCHAR(50), -- Частота пересмотра цен
last_review_date DATE,
next_review_date DATE,
market_positioning TEXT, -- Позиционирование по цене на рынке
competitor_price_analysis TEXT,
price_elasticity_estimate DECIMAL(5,2),
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_pricing_product FOREIGN KEY (product_id) REFERENCES products(id),
CONSTRAINT fk_pricing_strategy FOREIGN KEY (pricing_strategy_id) REFERENCES pricing_strategies(id),
CONSTRAINT uk_product_pricing UNIQUE (product_id)
);

CREATE TABLE value_based_pricing_factors (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
product_pricing_id BIGINT NOT NULL,
factor_name VARCHAR(100) NOT NULL,
factor_description TEXT,
measurement_method TEXT,
quantitative_value DECIMAL(15,2),
qualitative_value TEXT,
customer_segment_id BIGINT,
relative_importance DECIMAL(5,2), -- Весовой коэффициент
evidence_source TEXT, -- Источник данных
impact_on_price DECIMAL(15,2), -- Влияние на итоговую цену
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_factor_pricing FOREIGN KEY (product_pricing_id) REFERENCES product_pricing_models(id),
CONSTRAINT fk_factor_segment FOREIGN KEY (customer_segment_id) REFERENCES market_segments(id)
);

CREATE TABLE pricing_experiments (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
product_id BIGINT NOT NULL,
experiment_name VARCHAR(255) NOT NULL,
description TEXT,
start_date DATE NOT NULL,
end_date DATE,
control_price DECIMAL(15,2) NOT NULL,
test_prices JSON, -- Тестируемые варианты цен
target_metrics JSON, -- Метрики эффективности
segmentation_criteria JSON, -- Критерии сегментации для эксперимента
results JSON, -- Результаты эксперимента
conclusions TEXT,
implemented_changes TEXT,
status ENUM('planned', 'in_progress', 'completed', 'analyzed', 'implemented') DEFAULT 'planned',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT fk_experiment_product FOREIGN KEY (product_id) REFERENCES products(id)
);
