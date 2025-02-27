from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    icon = models.ImageField(upload_to='category_icons/', blank=True, null=True)

    def __str__(self):
        return self.name

class Spot(models.Model):
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    lng = models.FloatField()
    description = models.TextField()
    category = models.ForeignKey(Category, related_name='spots', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class SpotImage(models.Model):
    spot = models.ForeignKey(Spot, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='spot_images/')
    caption = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.spot.name} - {self.caption or 'Image'}"

class Route(models.Model):
    name = models.CharField(max_length=255)
    coordinates = models.JSONField(help_text="Enter a list of [lat, lng] pairs")

    def __str__(self):
        return self.name
