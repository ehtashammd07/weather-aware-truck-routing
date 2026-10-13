from django.urls import path
from router_api.views import (
    HealthCheckView,
    RiskRulesView,
    GeocodeView,
    CalculateRoutesView,
)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health"),
    path("risk-rules/", RiskRulesView.as_view(), name="risk-rules"),
    path("geocode/", GeocodeView.as_view(), name="geocode"),
    path("calculate-routes/", CalculateRoutesView.as_view(), name="calculate-routes"),
]
