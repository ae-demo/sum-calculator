# Technical decisions

- \[architecture\] The sum is a stateless POST operation, since it creates nothing and stores nothing. *assumed* (F1)
- \[data-model\] Numbers travel as JSON strings holding decimals so the sum is exact and unrounded. *assumed* (F1)
- \[security\] One handle, sums:calculate, gates the single operation; any signed-in person in the SumUsers group holds it. *assumed* (F1)
- \[sum-webapp\] Input is validated in the page with a number pattern; the service also rejects malformed numbers with 400. *assumed* (F1)