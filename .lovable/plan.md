

## Fix: Brace mismatch in PS1 inline template for RadioBrowserService.java

### Root Cause

In `radiosphere_v2_5_0.ps1`, line 1328, the `searchStations` method is missing its declaration signature. The code jumps from the closing brace of `fetchStationByUuid` (line 1326) directly into the method body:

```text
Line 1326:     }
Line 1327:
Line 1328:         List<StationData> nameResults = new ArrayList<>();  // <-- BUG: no method signature!
```

This causes the compiler to interpret `for` loops and `return` as top-level statements outside the class, producing all 25 errors.

### Fix (2 changes)

#### 1. `radiosphere_v2_5_0.ps1` — Add missing method signature (line 1328)

Replace line 1328:
```
        List<StationData> nameResults = new ArrayList<>();
```
With:
```
    private List<StationData> searchStations(String query, int limit) {
        List<StationData> nameResults = new ArrayList<>();
```

This single missing line is the cause of the entire build failure. The standalone `RadioBrowserService.java` file is already correct and needs no changes.

