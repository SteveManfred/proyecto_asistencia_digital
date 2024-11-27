#Mi urls.py:
from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from django.views.generic import RedirectView
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import dashboard_data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='login/', permanent=False)),
    path('login/', views.custom_login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('consumidor/', views.consumer_dashboard, name='consumidor'),
    path('administrador/', views.administrador_view, name='administrador'),
    path('registro/', views.registro_view, name='registro'),
    path('consumidor/caso/nuevo/', views.crear_caso, name='crear_caso'),
    path('consumidor/caso/<int:caso_id>/', views.ver_caso, name='ver_caso'),
    path('api/casos/', views.casos_api, name='casos_api'),
    path('api/casos/<int:caso_id>/', views.caso_detail_api, name='caso_detail_api'),
    path('api/todos_los_casos/', views.todos_los_casos, name='todos_los_casos'),
    path('api/crear_admin/', views.crear_admin, name='crear_admin'),
    path('api/dashboard/', dashboard_data, name='dashboard_data'),
    path('password_reset/', auth_views.PasswordResetView.as_view(
        template_name='password_reset/password_reset_form.html',
        email_template_name='password_reset/password_reset_email.html',
        subject_template_name='password_reset/password_reset_subject.txt',
        html_email_template_name='password_reset/password_reset_email.html'
    ), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='password_reset/password_reset_done.html'
    ), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='password_reset/password_reset_confirm.html'
    ), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='password_reset/password_reset_complete.html'
    ), name='password_reset_complete'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)