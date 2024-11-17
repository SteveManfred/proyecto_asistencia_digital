#Mi models.py:
from django.db import models
from django.contrib.auth.models import User

class Caso(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    conflict_type = models.CharField(max_length=100)
    conflict_details = models.CharField(max_length=255)
    product_size = models.CharField(max_length=100)
    purchase_conditions = models.CharField(max_length=100)
    store_response = models.CharField(max_length=100)
    resolution_expectation = models.CharField(max_length=100)
    acquisition_method = models.CharField(max_length=100)
    purchase_date = models.DateField()
    store_name = models.CharField(max_length=100)
    order_number = models.CharField(max_length=100)
    contacted_store = models.CharField(max_length=3)
    contact_date = models.DateField(null=True, blank=True)
    contact_method = models.CharField(max_length=50, null=True, blank=True)
    additional_details = models.TextField(null=True, blank=True)
    documents = models.FileField(upload_to='casos/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Caso de {self.usuario.username} - {self.store_name}"
