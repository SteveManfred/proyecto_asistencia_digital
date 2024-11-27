#Mi forms.py:
from django import forms
from core.models import Caso
from django.core.exceptions import ValidationError

class NuevoCasoForm(forms.ModelForm):
    class Meta:
        model = Caso
        fields = ['conflict_type', 'conflict_details', 'product_size', 
                 'purchase_conditions', 'store_response', 'resolution_expectation',
                 'acquisition_method', 'purchase_date', 'store_name', 'order_number',
                 'contacted_store', 'contact_date', 'contact_method',
                 'additional_details', 'documents']
        
        widgets = {
            'purchase_date': forms.DateInput(attrs={'type': 'date'}),
            'contact_date': forms.DateInput(attrs={'type': 'date'}),
            'additional_details': forms.Textarea(attrs={'rows': 4}),
            'documents': forms.ClearableFileInput(attrs={'multiple': True}),
        }

    def clean(self):
        cleaned_data = super().clean()
        contacted_store = cleaned_data.get('contacted_store')
        contact_date = cleaned_data.get('contact_date')
        contact_method = cleaned_data.get('contact_method')

        if contacted_store == 'si':
            if not contact_date:
                raise ValidationError('La fecha de contacto es requerida si se contactó con la tienda')
            if not contact_method:
                raise ValidationError('El método de contacto es requerido si se contactó con la tienda')

        return cleaned_data

    def clean_documents(self):
        documents = self.cleaned_data.get('documents')
        if documents:
            if documents.size > 5 * 1024 * 1024:  # 5MB limit
                raise ValidationError('El archivo es demasiado grande. El tamaño máximo es 5MB.')
        return documents
    