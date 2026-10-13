from django.urls import path, include
from django.http import HttpResponse

def api_root_welcome(request):
    html = """<!DOCTYPE html>
<html>
<head>
    <title>Weather-Aware Truck Routing API</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; line-height: 1.6; }
        .card { background: #1e293b; border-radius: 16px; padding: 30px; max-width: 650px; margin: 40px auto; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        h1 { color: #34d399; margin-top: 0; font-size: 24px; }
        a { color: #38bdf8; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .btn { display: inline-block; background: #059669; color: white !important; padding: 10px 18px; border-radius: 8px; font-weight: bold; margin-top: 10px; }
        .btn:hover { background: #10b981; }
        code { background: #0b0f19; padding: 3px 7px; border-radius: 6px; color: #fbbf24; font-family: Consolas, monospace; font-size: 13px; }
        ol { padding-left: 20px; }
        li { margin-bottom: 8px; }
        ul { padding-left: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Spotter Backend API is Online!</h1>
        <p>You have reached the <strong>Django REST API server</strong> (Port <code>8000</code>).</p>
        <p>To use the full interactive application (Map, Heatmap slider, Route cards, Input form):</p>
        <ol>
            <li>Keep this backend terminal running.</li>
            <li>Open a <strong>second terminal window</strong>.</li>
            <li>Run: <code>cd frontend</code> then <code>npm run dev</code></li>
            <li>Open the React dashboard in your browser:</li>
        </ol>
        <a href="http://localhost:3000" class="btn">Open React App (http://localhost:3000) &rarr;</a>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;">
        <p><strong>Available API Endpoints:</strong></p>
        <ul>
            <li><a href="/api/health/">/api/health/</a> (Service Healthcheck)</li>
            <li><a href="/api/risk-rules/">/api/risk-rules/</a> (Risk & Load Rubric Reference)</li>
            <li><a href="/api/geocode/?q=Denver">/api/geocode/?q=Denver</a> (Terminal Geocoding)</li>
        </ul>
    </div>
</body>
</html>"""
    return HttpResponse(html)

urlpatterns = [
    path("", api_root_welcome, name="api-root"),
    path("api/", include("router_api.urls")),
]
