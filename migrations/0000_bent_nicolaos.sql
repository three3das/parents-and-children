CREATE TABLE "game_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"current_word_index" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sentences_and_phrases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sentence" text NOT NULL,
	"translation" text NOT NULL,
	"audio" text NOT NULL,
	"difficulty" varchar DEFAULT 'easy' NOT NULL,
	"category" varchar DEFAULT 'general' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_answers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word_id" varchar NOT NULL,
	"is_correct" boolean DEFAULT false,
	"answered_at" timestamp with time zone DEFAULT now(),
	"session_id" varchar NOT NULL,
	"game_type" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"newsletter" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "word_translations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word_id" varchar NOT NULL,
	"language" varchar(5) NOT NULL,
	"translation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"image" text NOT NULL,
	"audio" text NOT NULL,
	"word_english" text
);
