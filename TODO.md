- build a node.js server to parse productfeeds from shops, store the
parsed values and return them as JSON

- feeds adding from the frontend

- the server should answer to GET-requests in the form:

/?shop=$shopname&product_id=$product_id with JSON in the form {$product_id:$price}
/?shop=$shopname with JSON in the form [$product_id,....]

- data should be fetched inside the server and stored internally

- documentation how to install & run the server (e.g. README.md)

Example product feeds to fetch & parse:
- http://www.apodiscounter.de/partnerprogramme/krn.csv (shopname:
"apodiscounter")
-
http://preisexporte.apobyte.de/www.eurapon.de/preissuchmaschine/preissuchmaschine.csv
(shopname: "eurapon")

example (for host "localhost" & port "9000"):
- call to http://localhost:9000?shop=europon&product_id=00000106 should
return { 00000106:7.09 }
