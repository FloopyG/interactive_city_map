from django.contrib import admin
from .models import Category, Spot, SpotImage, Route

class SpotImageInline(admin.TabularInline):
    model = SpotImage
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Spot)
class SpotAdmin(admin.ModelAdmin):
    list_display = ('name', 'lat', 'lng', 'category')
    search_fields = ('name',)
    inlines = [SpotImageInline]

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
