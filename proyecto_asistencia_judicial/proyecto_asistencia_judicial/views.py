#Mi views.py:
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django import forms
from django.db import IntegrityError
from .forms import NuevoCasoForm
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from core.models import Caso
from django.views.decorators.csrf import csrf_exempt
import logging
from django.db.models import Count
from django.db.models.functions import Coalesce
from django.db.models import Value
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta


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
    usuario = request.user
    return render(request, 'administrador.html', {'usuario': usuario})

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


logger = logging.getLogger(__name__)

@login_required
def crear_caso(request):
    # Verifica si el usuario es un administrador o un consumidor
    if request.method == 'POST':
        form = NuevoCasoForm(request.POST, request.FILES)
        required_fields = ['conflict_type', 'conflict_details', 'product_size', 
                         'purchase_conditions', 'store_response', 'resolution_expectation',
                         'acquisition_method', 'purchase_date', 'store_name', 'order_number']
        
        missing_fields = [field for field in required_fields if not request.POST.get(field)]
        
        if missing_fields:
            messages.error(request, f"Faltan los siguientes campos requeridos: {', '.join(missing_fields)}")
            return render(request, 'asistencia_casos/new_case.html', {'form': form})

        if form.is_valid():
            try:
                caso = form.save(commit=False)
                caso.usuario = request.user  # Asigna el caso al usuario que lo crea
                caso.save()
                
                if 'documents' in request.FILES:
                    caso.documents = request.FILES['documents']
                    caso.save()
                
                messages.success(request, "El caso ha sido registrado exitosamente.")
                return redirect('administrador' if request.user.is_staff else 'consumidor')  # Redirige según el rol del usuario
            
            except Exception as e:
                messages.error(request, "Ocurrió un error al guardar el caso. Por favor, intente nuevamente.")
                return render(request, 'asistencia_casos/new_case.html', {'form': form})
    else:
        form = NuevoCasoForm()
    
    return render(request, 'asistencia_casos/new_case.html', {'form': form})


@login_required
def ver_caso(request, caso_id):
    if request.user.is_staff:
        caso = get_object_or_404(Caso, id=caso_id)
    else:
        caso = get_object_or_404(Caso, id=caso_id, usuario=request.user)
    return render(request, 'asistencia_casos/caso_detalle.html', {'caso': caso})

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
            'acquisition_method': caso.acquisition_method,
            'conflict_type': caso.conflict_type,
        })
    return JsonResponse(casos_data, safe=False)

# Eliminación de casos
@login_required
@require_http_methods(['DELETE'])
def caso_detail_api(request, caso_id):
    try:
        if request.user.is_staff:
            caso = Caso.objects.get(id=caso_id)
        else:
            caso = Caso.objects.get(id=caso_id, usuario=request.user)
        caso.delete()
        return JsonResponse({'status': 'success'})
    except Caso.DoesNotExist:
        return JsonResponse({'error': 'Caso no encontrado'}, status=404)
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        return JsonResponse({'error': 'Ocurrió un error inesperado'}, status=500)
    
# Vista para obtener todos los casos (solo para administradores)
@login_required
@user_passes_test(lambda u: u.is_staff)
def todos_los_casos(request):
    casos = Caso.objects.all().order_by('-created_at')
    casos_data = []
    for caso in casos:
        rut_usuario = caso.usuario.username
        casos_data.append({
            'id': caso.id,
            'created_at': caso.created_at.isoformat(),
            'purchase_date': caso.purchase_date.isoformat(),
            'store_name': caso.store_name,
            'acquisition_method': caso.acquisition_method,
            'rut_usuario': rut_usuario,
            'conflict_type': caso.conflict_type
        })
    return JsonResponse(casos_data, safe=False)

# Formulario de registro para nuevo administrador
@csrf_exempt
@require_http_methods(['POST'])
@login_required
@user_passes_test(lambda u: u.is_staff)
def crear_admin(request):
    username = request.POST.get('username')
    first_name = request.POST.get('first_name')
    email = request.POST.get('email')
    password = request.POST.get('password')
    password_confirm = request.POST.get('password_confirm')

    if password != password_confirm:
        return JsonResponse({'status': 'error', 'error': 'Las contraseñas no coinciden'})

    try:
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            email=email,
            password=password
        )
        user.is_staff = True
        user.save()

        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'error': str(e)})

# Panel de control de administrador    
@login_required
@user_passes_test(lambda u: u.is_staff)
def dashboard_data(request):
    # Resumen General
    total_casos = Caso.objects.count()
    
    resumen_general = {
        'total_casos': total_casos,
        'tipos_conflicto': list(Caso.objects.values('conflict_type').annotate(count=Count('id'))),
        'detalles_conflicto': list(Caso.objects.values('conflict_details').annotate(count=Count('id'))),
        'tamanos_producto': list(Caso.objects.values('product_size').annotate(count=Count('id'))),
        'condiciones_compra': list(Caso.objects.values('purchase_conditions').annotate(count=Count('id'))),
        'metodos_adquisicion': list(Caso.objects.values('acquisition_method').annotate(count=Count('id'))),
        'respuestas_tienda': list(Caso.objects.values('store_response').annotate(count=Count('id'))),
        'expectativas_resolucion': list(Caso.objects.values('resolution_expectation').annotate(count=Count('id'))),
    }
    
    # Resumen del Último Mes
    hace_un_mes = timezone.now() - timedelta(days=30)
    casos_ultimo_mes = Caso.objects.filter(created_at__gte=hace_un_mes)
    
    resumen_ultimo_mes = {
        'total_casos': casos_ultimo_mes.count(),
        'tipos_conflicto': list(casos_ultimo_mes.values('conflict_type').annotate(count=Count('id'))),
        'detalles_conflicto': list(casos_ultimo_mes.values('conflict_details').annotate(count=Count('id'))),
        'tamanos_producto': list(casos_ultimo_mes.values('product_size').annotate(count=Count('id'))),
        'condiciones_compra': list(casos_ultimo_mes.values('purchase_conditions').annotate(count=Count('id'))),
        'metodos_adquisicion': list(casos_ultimo_mes.values('acquisition_method').annotate(count=Count('id'))),
        'respuestas_tienda': list(casos_ultimo_mes.values('store_response').annotate(count=Count('id'))),
        'expectativas_resolucion': list(casos_ultimo_mes.values('resolution_expectation').annotate(count=Count('id'))),
    }
    
    return JsonResponse({
        'resumen_general': resumen_general,
        'resumen_ultimo_mes': resumen_ultimo_mes
    })


# Reemplaza los valores nulos por un valor predeterminado
tipos_conflicto = Caso.objects.values('conflict_type')\
    .annotate(count=Count('id'))\
    .order_by('conflict_type')