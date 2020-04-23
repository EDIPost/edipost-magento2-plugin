Sett opp utviklingsmiljø:
```
docker-compose up -d
docker-compose exec web install-magento
docker-compose exec web install-sampledata
```

Kjør disse kommandoene fra containeren. Logg inn med `docker-compose exec web bash`
```
/var/www/html/bin/magento cache:flush
/var/www/html/bin/magento cache:enable
/var/www/html/bin/magento deploy:mode:set developer

chown -R www-data.www-data /var/www/html/var/cache/
chown -R www-data.www-data /var/www/html/generated/
```

Gå til [http://local.magento:8080/admin](http://local.magento:8080/admin)

phpMyAdmin på [http://localhost:8580/](http://localhost:8580/)