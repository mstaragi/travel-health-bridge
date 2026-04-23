$replacements = @(
  @{ old = 'TravelMedix helps you find verified doctors. We are a referral platform, not a medical provider.'; new = 'Travel Health Bridge helps you find verified doctors. We are a referral platform, not a medical provider.' }
  @{ old = 'TravelMedix verified providers are not yet available in your area. Please follow these safety guidelines:'; new = 'Travel Health Bridge verified providers are not yet available in your area. Please follow these safety guidelines:' }
  @{ old = 'TravelMedix verified providers are not available in this location. Follow this safety checklist:'; new = 'Travel Health Bridge verified providers are not available in this location. Follow this safety checklist:' }
  @{ old = 'I am in a city not covered by TravelMedix and need assistance.'; new = 'I am in a city not covered by Travel Health Bridge and need assistance.' }
  @{ old = 'Language verified by TravelMedix. Tests communication ability.'; new = 'Language verified by Travel Health Bridge. Tests communication ability.' }
  @{ old = 'TravelMedix Emergency Line'; new = 'Travel Health Bridge Emergency Line' }
  @{ old = 'TravelMedix enforces price transparency. Your report helps protect other travelers.'; new = 'Travel Health Bridge enforces price transparency. Your report helps protect other travelers.' }
  @{ old = 'Before opening TravelMedix, had anyone or anything already suggested a doctor to you?'; new = 'Before opening Travel Health Bridge, had anyone or anything already suggested a doctor to you?' }
  @{ old = 'Would you use TravelMedix again in another city?'; new = 'Would you use Travel Health Bridge again in another city?' }
  @{ old = 'travelmedix-triage-storage'; new = 'thb-triage-storage' }
  @{ old = 'ops@travelmedix.com'; new = 'ops@travelhealthbridge.com' }
  @{ old = '>TravelMedix<'; new = '>Travel Health Bridge<' }
  @{ old = 'TravelMedix was my first step'; new = 'Travel Health Bridge was my first step' }
)

Get-ChildItem -Path "C:\Users\MAHENDRA TARAGI\.gemini\antigravity\scratch\TravelMedix-v2" -Include "*.ts","*.tsx" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" } | ForEach-Object {
  $file = $_
  $content = [System.IO.File]::ReadAllText($file.FullName)
  $changed = $false
  foreach ($r in $replacements) {
    if ($content.Contains($r.old)) {
      $content = $content.Replace($r.old, $r.new)
      $changed = $true
    }
  }
  if ($changed) {
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed: $($file.Name)"
  }
}
Write-Host "Done."
