from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django import forms
from django.db import IntegrityError

# Vista para el consumidor
@login_required
def consumer_dashboard(request):
    usuario = request.user  # Obtener datos del consumidor autenticado
    
    # Verificar si se ha solicitado el formulario de nuevo caso
    if request.GET.get('section') == 'new-case':
        # Asegúrate de que la plantilla esté ubicada en la subcarpeta 'asistencia_casos'
        return render(request, 'asistencia_casos/new_case.html', {'usuario': usuario})
    
    # Si no es la sección de 'new-case', simplemente cargar el dashboard
    return render(request, 'consumidor.html', {'usuario': usuario})

# Vista para el administrador
@login_required
@user_passes_test(lambda u: u.is_staff)
def administrador_view(request):
    return render(request, 'administrador.html')

# Formulario de registro para nuevo consumidor
class RegistroForm(forms.Form):
    nombre_completo = forms.CharField(label="Nombre Completo", max_length=100)
    rut = forms.CharField(label="RUT", max_length=12)
    email = forms.EmailField(label="Correo Electrónico")
    password = forms.CharField(label="Contraseña", widget=forms.PasswordInput)
    password_confirm = forms.CharField(label="Confirmar Contraseña", widget=forms.PasswordInput)
    terms = forms.BooleanField(label="Acepto los términos y condiciones", required=True)

def registro_view(request):
    if request.method == "POST":
        form = RegistroForm(request.POST)
        if form.is_valid():
            password = form.cleaned_data.get("password")
            password_confirm = form.cleaned_data.get("password_confirm")
            
            # Verificar coincidencia de contraseñas
            if password != password_confirm:
                form.add_error("password_confirm", "Las contraseñas no coinciden.")
            else:
                # Intentar crear un nuevo usuario
                try:
                    User.objects.create_user(
                        username=form.cleaned_data.get("rut"),
                        password=password,
                        email=form.cleaned_data.get("email"),
                        first_name=form.cleaned_data.get("nombre_completo")
                    )
                    messages.success(request, "Nuevo usuario registrado.")
                    return redirect("login")
                except IntegrityError:
                    form.add_error("email", "El correo o RUT ya están registrados.")
    else:
        form = RegistroForm()
    return render(request, "registro.html", {"form": form})  # Mensajes se mostrarán aquí

# Formulario de inicio de sesión
class LoginForm(forms.Form):
    username = forms.CharField(label='Usuario', max_length=150)
    password = forms.CharField(label='Contraseña', widget=forms.PasswordInput)

# Vista personalizada de inicio de sesión
from django.shortcuts import redirect

def custom_login_view(request):
    form = LoginForm()  # Inicializa el formulario vacío

    if request.method == "POST":
        form = LoginForm(request.POST)  # Crea una instancia con datos POST
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                next_url = request.GET.get('next')  # Obtener el parámetro 'next'
                if next_url:  # Si hay un next_url, redirigir allí
                    return redirect(next_url)
                elif user.is_staff:
                    return redirect('administrador')
                else:
                    return redirect('consumidor')
            else:
                messages.error(request, "Usuario o contraseña incorrectos.")
                return redirect('login')  # Redirigir a la página de login para limpiar el formulario

    return render(request, 'login.html', {'form': form})  # Pasar el formulario al template

# Pare redireccionar a login al usar logout

def logout_view(request):
    logout(request)
    return redirect('login')



