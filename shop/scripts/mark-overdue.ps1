# Marks overdue invoices -- run daily via Windows Task Scheduler
$scriptDir = "C:\Users\james\Dev\mobile-shop-app\shop"
$timestamp  = Get-Date -Format "yyyy-MM-dd HH:mm"

try {
    $output = node "$scriptDir\scripts\mark-overdue.mjs" 2>&1
    Write-Output $output
} catch {
    Write-Output "$timestamp - ERROR: $($_.Exception.Message)"
}
