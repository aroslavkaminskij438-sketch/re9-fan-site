(function () {
  window.RE9_SUPABASE_URL = "https://tiazyvgifgcsjybdpolm.supabase.co";

  window.RE9_SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYXp5dmdpZmdjc2p5YmRwb2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDcwODcsImV4cCI6MjA4ODI4MzA4N30.tNpN0a5L8SE8Z0zoDXUiSDYEP01vhh_mi9v9K1oNSZE";

  if (!window.supabase) {
    console.error("Supabase SDK не подключён. Проверь CDN script в HTML.");
    return;
  }

  if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(
      window.RE9_SUPABASE_URL,
      window.RE9_SUPABASE_ANON_KEY
    );
  }
})();