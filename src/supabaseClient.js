import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://sljghfimicqvcbvycjwm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsamdoZmltaWNxdmNidnljandtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTg4NjcsImV4cCI6MjA5MzM5NDg2N30.8quJXFWGC8pd718lXw4jvFlayd1jsfQPOZUJaqKCjyk"
);