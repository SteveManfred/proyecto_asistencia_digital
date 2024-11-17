#Mi views.py:
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django import forms
from django.db import IntegrityError
from .forms import NuevoCasoForm
from core.models import Caso

# Vista para el consumidor
@login_required
def consumer_dashboard(request):
    usuario = request.user
    if request.GET.get('section') == 'new-case':
        return render(request, 'asistencia_casos/new_case.html', {'usuario': usuario})
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
            if password != password_confirm:
                form.add_error("password_confirm", "Las contraseñas no coinciden.")
            else:
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
    return render(request, "registro.html", {"form": form})

# Formulario de inicio de sesión
class LoginForm(forms.Form):
    username = forms.CharField(label='Usuario', max_length=150)
    password = forms.CharField(label='Contraseña', widget=forms.PasswordInput)

# Vista personalizada de inicio de sesión
def custom_login_view(request):
    form = LoginForm()
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                next_url = request.GET.get('next', None)
                if next_url:
                    return redirect(next_url)
                return redirect('administrador' if user.is_staff else 'consumidor')
            else:
                messages.error(request, "Usuario o contraseña incorrectos.")
                return redirect('login')
    return render(request, 'login.html', {'form': form})

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import NuevoCasoForm
import logging

logger = logging.getLogger(__name__)

@login_required
def crear_caso(request):
    if request.method == 'POST':
        logger.debug(f"Datos POST recibidos: {request.POST}")
        logger.debug(f"Archivos recibidos: {request.FILES}")
        
        form = NuevoCasoForm(request.POST, request.FILES)
        
        # Verificar si todos los campos requeridos están presentes
        required_fields = ['conflict_type', 'conflict_details', 'product_size', 
                         'purchase_conditions', 'store_response', 'resolution_expectation',
                         'acquisition_method', 'purchase_date', 'store_name', 'order_number']
        
        missing_fields = [field for field in required_fields if not request.POST.get(field)]
        
        if missing_fields:
            logger.error(f"Campos faltantes: {missing_fields}")
            messages.error(request, f"Faltan los siguientes campos requeridos: {', '.join(missing_fields)}")
            return render(request, 'asistencia_casos/new_case.html', {'form': form})
        
        if form.is_valid():
            try:
                caso = form.save(commit=False)
                caso.usuario = request.user
                caso.save()
                
                # Si hay archivos adjuntos, guardarlos
                if 'documents' in request.FILES:
                    caso.documents = request.FILES['documents']
                    caso.save()
                
                logger.info(f"Caso creado exitosamente: ID {caso.id}")
                messages.success(request, "El caso ha sido registrado exitosamente.")
                return redirect('consumidor')
            
            except Exception as e:
                logger.error(f"Error al guardar el caso: {str(e)}")
                messages.error(request, "Ocurrió un error al guardar el caso. Por favor, intente nuevamente.")
        else:
            logger.error(f"Errores de validación del formulario: {form.errors}")
            messages.error(request, "Por favor corrija los errores en el formulario.")
    else:
        form = NuevoCasoForm()
    
    return render(request, 'asistencia_casos/new_case.html', {'form': form})

@login_required
def ver_caso(request, caso_id):
    caso = get_object_or_404(Caso, id=caso_id, usuario=request.user)
    return render(request, 'asistencia_casos/caso_detalle.html', {'caso': caso})




from django.http import JsonResponse
from django.core.serializers import serialize
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
import json

@login_required
def casos_api(request):
    casos = Caso.objects.filter(usuario=request.user).order_by('-created_at')
    casos_data = []
    
    for caso in casos:
        casos_data.append({
            'id': caso.id,
            'created_at': caso.created_at.isoformat(),
            'purchase_date': caso.purchase_date.isoformat(),
            'store_name': caso.store_name,
            'acquisition_method': caso.acquisition_method
        })
    
    return JsonResponse(casos_data, safe=False)

@login_required
@require_http_methods(['DELETE'])
def caso_detail_api(request, caso_id):
    try:
        caso = Caso.objects.get(id=caso_id, usuario=request.user)
        caso.delete()
        return JsonResponse({'status': 'success'})
    except Caso.DoesNotExist:
        return JsonResponse({'error': 'Caso no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)