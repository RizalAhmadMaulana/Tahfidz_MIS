from rest_framework import serializers
from .models import WATemplate, WAMessageLog

class WATemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WATemplate
        fields = '__all__'

class WAMessageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WAMessageLog
        fields = '__all__'