// Generated mechanically from the uploaded workbook.
export const workbookSeed = {
  "source": {
    "filename": "Candle_Manufacturing_Inventory_Production_System.xlsx",
    "importedOn": "2026-08-12",
    "worksheetCount": 15,
    "formulaCount": 2026,
    "strayPlaceholderCount": 136
  },
  "settings": {
    "businessName": "Lumina Candle Works",
    "currency": "GBP (£)",
    "vatBps": 2000,
    "wasteBps": 300,
    "labourRatePencePerHour": 1450,
    "targetMarginBps": 6500,
    "units": [
      "g",
      "kg",
      "ml",
      "litres",
      "units",
      "rolls",
      "sheets",
      "boxes"
    ],
    "materialCategories": [
      "WAX",
      "FRAGRANCE",
      "WICKS",
      "COLOURANTS",
      "CONTAINERS",
      "PACKAGING",
      "OTHER"
    ],
    "productCategories": [
      "Signature",
      "Travel",
      "Coastal",
      "Botanical"
    ],
    "movementTypes": [
      "Purchase Receipt",
      "Production Consumption",
      "Production Output",
      "Adjustment In",
      "Adjustment Out",
      "Waste",
      "Damage",
      "Return",
      "Sample",
      "Other"
    ],
    "productionStatuses": [
      "Planned",
      "In Production",
      "Completed",
      "Cancelled"
    ],
    "poStatuses": [
      "Draft",
      "Ordered",
      "Part Received",
      "Received",
      "Cancelled"
    ],
    "locations": [
      "A1",
      "A2",
      "A3",
      "B1",
      "B2",
      "C1",
      "D1",
      "E1",
      "Warehouse",
      "Production Floor"
    ],
    "wasteTypes": [
      "Wax Spillage",
      "Fragrance Loss",
      "Damaged Jar",
      "Failed Candle",
      "Label Damage",
      "Packaging Damage"
    ]
  },
  "suppliers": [
    {
      "id": "SUP-001",
      "name": "Northstar Wax Co.",
      "contactName": "Ava Hart",
      "email": "ava@northstar.example",
      "phone": "020 5550 1001",
      "website": "https://northstar.example",
      "address": "1 Harbour Way, Bristol",
      "leadTimeDays": 7,
      "minimumOrderPence": 25000,
      "paymentTerms": "30 days",
      "materialsSupplied": "Waxes",
      "active": true,
      "notes": "Fictional supplier"
    },
    {
      "id": "SUP-002",
      "name": "Aroma House Labs",
      "contactName": "Leo Grant",
      "email": "leo@aromahouse.example",
      "phone": "020 5550 1002",
      "website": "https://aromahouse.example",
      "address": "9 Cedar Park, Leeds",
      "leadTimeDays": 10,
      "minimumOrderPence": 15000,
      "paymentTerms": "Pro forma",
      "materialsSupplied": "Fragrance oils",
      "active": true,
      "notes": "Fictional supplier"
    },
    {
      "id": "SUP-003",
      "name": "Vessel & Tin Works",
      "contactName": "Maya Cole",
      "email": "maya@vessel.example",
      "phone": "020 5550 1003",
      "website": "https://vessel.example",
      "address": "22 Foundry Lane, Sheffield",
      "leadTimeDays": 14,
      "minimumOrderPence": 40000,
      "paymentTerms": "30 days",
      "materialsSupplied": "Jars, tins and lids",
      "active": true,
      "notes": "Fictional supplier"
    },
    {
      "id": "SUP-004",
      "name": "Brightwick Components",
      "contactName": "Noah Reid",
      "email": "noah@brightwick.example",
      "phone": "020 5550 1004",
      "website": "https://brightwick.example",
      "address": "4 Mill Road, York",
      "leadTimeDays": 6,
      "minimumOrderPence": 10000,
      "paymentTerms": "14 days",
      "materialsSupplied": "Wicks and accessories",
      "active": true,
      "notes": "Fictional supplier"
    },
    {
      "id": "SUP-005",
      "name": "Paper & Pack Studio",
      "contactName": "Ivy Moss",
      "email": "ivy@paperpack.example",
      "phone": "020 5550 1005",
      "website": "https://paperpack.example",
      "address": "18 Print Street, London",
      "leadTimeDays": 8,
      "minimumOrderPence": 20000,
      "paymentTerms": "30 days",
      "materialsSupplied": "Labels and packaging",
      "active": true,
      "notes": "Fictional supplier"
    }
  ],
  "materials": [
    {
      "id": "MAT-001",
      "name": "Soy Wax",
      "category": "WAX",
      "supplierId": "SUP-001",
      "supplierSku": "NS-SOY25",
      "unit": "g",
      "packSizeMilli": 25000000,
      "purchasePriceMicros": 82500000,
      "unitCostMicros": 3300,
      "minimumStockMilli": 10000000,
      "reorderPointMilli": 15000000,
      "preferredOrderQtyMilli": 25000000,
      "leadTimeDays": 7,
      "lastPurchaseUnitCostMicros": 3300,
      "location": "A1",
      "active": true
    },
    {
      "id": "MAT-002",
      "name": "Coconut Wax",
      "category": "WAX",
      "supplierId": "SUP-001",
      "supplierSku": "NS-COCO20",
      "unit": "g",
      "packSizeMilli": 20000000,
      "purchasePriceMicros": 94000000,
      "unitCostMicros": 4700,
      "minimumStockMilli": 5000000,
      "reorderPointMilli": 7500000,
      "preferredOrderQtyMilli": 20000000,
      "leadTimeDays": 7,
      "lastPurchaseUnitCostMicros": 4700,
      "location": "A2",
      "active": true
    },
    {
      "id": "MAT-003",
      "name": "Paraffin Wax",
      "category": "WAX",
      "supplierId": "SUP-001",
      "supplierSku": "NS-PAR25",
      "unit": "g",
      "packSizeMilli": 25000000,
      "purchasePriceMicros": 68000000,
      "unitCostMicros": 2720,
      "minimumStockMilli": 5000000,
      "reorderPointMilli": 7000000,
      "preferredOrderQtyMilli": 25000000,
      "leadTimeDays": 7,
      "lastPurchaseUnitCostMicros": 2720,
      "location": "A3",
      "active": true
    },
    {
      "id": "MAT-004",
      "name": "Vanilla Fragrance Oil",
      "category": "FRAGRANCE",
      "supplierId": "SUP-002",
      "supplierSku": "AH-VAN5",
      "unit": "g",
      "packSizeMilli": 5000000,
      "purchasePriceMicros": 110000000,
      "unitCostMicros": 22000,
      "minimumStockMilli": 1000000,
      "reorderPointMilli": 1500000,
      "preferredOrderQtyMilli": 5000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 22000,
      "location": "B1",
      "active": true
    },
    {
      "id": "MAT-005",
      "name": "Lavender Fragrance Oil",
      "category": "FRAGRANCE",
      "supplierId": "SUP-002",
      "supplierSku": "AH-LAV5",
      "unit": "g",
      "packSizeMilli": 5000000,
      "purchasePriceMicros": 105000000,
      "unitCostMicros": 21000,
      "minimumStockMilli": 1000000,
      "reorderPointMilli": 1500000,
      "preferredOrderQtyMilli": 5000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 21000,
      "location": "B2",
      "active": true
    },
    {
      "id": "MAT-006",
      "name": "Sandalwood Fragrance Oil",
      "category": "FRAGRANCE",
      "supplierId": "SUP-002",
      "supplierSku": "AH-SAN5",
      "unit": "g",
      "packSizeMilli": 5000000,
      "purchasePriceMicros": 125000000,
      "unitCostMicros": 25000,
      "minimumStockMilli": 1000000,
      "reorderPointMilli": 1500000,
      "preferredOrderQtyMilli": 5000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 25000,
      "location": "B3",
      "active": true
    },
    {
      "id": "MAT-007",
      "name": "Sea Salt Fragrance Oil",
      "category": "FRAGRANCE",
      "supplierId": "SUP-002",
      "supplierSku": "AH-SEA5",
      "unit": "g",
      "packSizeMilli": 5000000,
      "purchasePriceMicros": 118000000,
      "unitCostMicros": 23600,
      "minimumStockMilli": 1000000,
      "reorderPointMilli": 1500000,
      "preferredOrderQtyMilli": 5000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 23600,
      "location": "B4",
      "active": true
    },
    {
      "id": "MAT-008",
      "name": "Cedar Fragrance Oil",
      "category": "FRAGRANCE",
      "supplierId": "SUP-002",
      "supplierSku": "AH-CED5",
      "unit": "g",
      "packSizeMilli": 5000000,
      "purchasePriceMicros": 120000000,
      "unitCostMicros": 24000,
      "minimumStockMilli": 1000000,
      "reorderPointMilli": 1500000,
      "preferredOrderQtyMilli": 5000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 24000,
      "location": "B5",
      "active": true
    },
    {
      "id": "MAT-009",
      "name": "Rose Fragrance Oil",
      "category": "FRAGRANCE",
      "supplierId": "SUP-002",
      "supplierSku": "AH-ROS5",
      "unit": "g",
      "packSizeMilli": 5000000,
      "purchasePriceMicros": 115000000,
      "unitCostMicros": 23000,
      "minimumStockMilli": 1000000,
      "reorderPointMilli": 1500000,
      "preferredOrderQtyMilli": 5000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 23000,
      "location": "B6",
      "active": true
    },
    {
      "id": "MAT-010",
      "name": "Cotton Wick",
      "category": "WICKS",
      "supplierId": "SUP-004",
      "supplierSku": "BW-CW1000",
      "unit": "units",
      "packSizeMilli": 1000000,
      "purchasePriceMicros": 42000000,
      "unitCostMicros": 42000,
      "minimumStockMilli": 400000,
      "reorderPointMilli": 600000,
      "preferredOrderQtyMilli": 1000000,
      "leadTimeDays": 6,
      "lastPurchaseUnitCostMicros": 42000,
      "location": "C1",
      "active": true
    },
    {
      "id": "MAT-011",
      "name": "Wooden Wick",
      "category": "WICKS",
      "supplierId": "SUP-004",
      "supplierSku": "BW-WW500",
      "unit": "units",
      "packSizeMilli": 500000,
      "purchasePriceMicros": 55000000,
      "unitCostMicros": 110000,
      "minimumStockMilli": 150000,
      "reorderPointMilli": 250000,
      "preferredOrderQtyMilli": 500000,
      "leadTimeDays": 6,
      "lastPurchaseUnitCostMicros": 110000,
      "location": "C2",
      "active": true
    },
    {
      "id": "MAT-012",
      "name": "Ivory Dye",
      "category": "COLOURANTS",
      "supplierId": "SUP-002",
      "supplierSku": "AH-DIV1",
      "unit": "g",
      "packSizeMilli": 1000000,
      "purchasePriceMicros": 28000000,
      "unitCostMicros": 28000,
      "minimumStockMilli": 150000,
      "reorderPointMilli": 250000,
      "preferredOrderQtyMilli": 1000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 28000,
      "location": "B7",
      "active": true
    },
    {
      "id": "MAT-013",
      "name": "Blue Dye",
      "category": "COLOURANTS",
      "supplierId": "SUP-002",
      "supplierSku": "AH-DBL1",
      "unit": "g",
      "packSizeMilli": 1000000,
      "purchasePriceMicros": 30000000,
      "unitCostMicros": 30000,
      "minimumStockMilli": 150000,
      "reorderPointMilli": 250000,
      "preferredOrderQtyMilli": 1000000,
      "leadTimeDays": 10,
      "lastPurchaseUnitCostMicros": 30000,
      "location": "B8",
      "active": true
    },
    {
      "id": "MAT-014",
      "name": "Amber Jar 220ml",
      "category": "CONTAINERS",
      "supplierId": "SUP-003",
      "supplierSku": "VT-AJ220",
      "unit": "units",
      "packSizeMilli": 48000,
      "purchasePriceMicros": 67200000,
      "unitCostMicros": 1400000,
      "minimumStockMilli": 100000,
      "reorderPointMilli": 150000,
      "preferredOrderQtyMilli": 288000,
      "leadTimeDays": 14,
      "lastPurchaseUnitCostMicros": 1400000,
      "location": "D1",
      "active": true
    },
    {
      "id": "MAT-015",
      "name": "Clear Jar 300ml",
      "category": "CONTAINERS",
      "supplierId": "SUP-003",
      "supplierSku": "VT-CJ300",
      "unit": "units",
      "packSizeMilli": 36000,
      "purchasePriceMicros": 72000000,
      "unitCostMicros": 2000000,
      "minimumStockMilli": 80000,
      "reorderPointMilli": 120000,
      "preferredOrderQtyMilli": 216000,
      "leadTimeDays": 14,
      "lastPurchaseUnitCostMicros": 2000000,
      "location": "D2",
      "active": true
    },
    {
      "id": "MAT-016",
      "name": "Travel Tin 120ml",
      "category": "CONTAINERS",
      "supplierId": "SUP-003",
      "supplierSku": "VT-TT120",
      "unit": "units",
      "packSizeMilli": 72000,
      "purchasePriceMicros": 64800000,
      "unitCostMicros": 900000,
      "minimumStockMilli": 120000,
      "reorderPointMilli": 180000,
      "preferredOrderQtyMilli": 360000,
      "leadTimeDays": 14,
      "lastPurchaseUnitCostMicros": 900000,
      "location": "D3",
      "active": true
    },
    {
      "id": "MAT-017",
      "name": "Amber Jar Lid",
      "category": "PACKAGING",
      "supplierId": "SUP-003",
      "supplierSku": "VT-ALID",
      "unit": "units",
      "packSizeMilli": 48000,
      "purchasePriceMicros": 28800000,
      "unitCostMicros": 600000,
      "minimumStockMilli": 100000,
      "reorderPointMilli": 150000,
      "preferredOrderQtyMilli": 288000,
      "leadTimeDays": 14,
      "lastPurchaseUnitCostMicros": 600000,
      "location": "D4",
      "active": true
    },
    {
      "id": "MAT-018",
      "name": "Clear Jar Lid",
      "category": "PACKAGING",
      "supplierId": "SUP-003",
      "supplierSku": "VT-CLID",
      "unit": "units",
      "packSizeMilli": 36000,
      "purchasePriceMicros": 25200000,
      "unitCostMicros": 700000,
      "minimumStockMilli": 80000,
      "reorderPointMilli": 120000,
      "preferredOrderQtyMilli": 216000,
      "leadTimeDays": 14,
      "lastPurchaseUnitCostMicros": 700000,
      "location": "D5",
      "active": true
    },
    {
      "id": "MAT-019",
      "name": "Tin Lid",
      "category": "PACKAGING",
      "supplierId": "SUP-003",
      "supplierSku": "VT-TLID",
      "unit": "units",
      "packSizeMilli": 72000,
      "purchasePriceMicros": 32400000,
      "unitCostMicros": 450000,
      "minimumStockMilli": 120000,
      "reorderPointMilli": 180000,
      "preferredOrderQtyMilli": 360000,
      "leadTimeDays": 14,
      "lastPurchaseUnitCostMicros": 450000,
      "location": "D6",
      "active": true
    },
    {
      "id": "MAT-020",
      "name": "Front Label Amber",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-LA500",
      "unit": "units",
      "packSizeMilli": 500000,
      "purchasePriceMicros": 65000000,
      "unitCostMicros": 130000,
      "minimumStockMilli": 150000,
      "reorderPointMilli": 250000,
      "preferredOrderQtyMilli": 500000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 130000,
      "location": "E1",
      "active": true
    },
    {
      "id": "MAT-021",
      "name": "Front Label Clear",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-LC500",
      "unit": "units",
      "packSizeMilli": 500000,
      "purchasePriceMicros": 68000000,
      "unitCostMicros": 136000,
      "minimumStockMilli": 150000,
      "reorderPointMilli": 250000,
      "preferredOrderQtyMilli": 500000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 136000,
      "location": "E2",
      "active": true
    },
    {
      "id": "MAT-022",
      "name": "Front Label Tin",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-LT500",
      "unit": "units",
      "packSizeMilli": 500000,
      "purchasePriceMicros": 58000000,
      "unitCostMicros": 116000,
      "minimumStockMilli": 150000,
      "reorderPointMilli": 250000,
      "preferredOrderQtyMilli": 500000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 116000,
      "location": "E3",
      "active": true
    },
    {
      "id": "MAT-023",
      "name": "Warning Label",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-WL1000",
      "unit": "units",
      "packSizeMilli": 1000000,
      "purchasePriceMicros": 48000000,
      "unitCostMicros": 48000,
      "minimumStockMilli": 400000,
      "reorderPointMilli": 600000,
      "preferredOrderQtyMilli": 1000000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 48000,
      "location": "E4",
      "active": true
    },
    {
      "id": "MAT-024",
      "name": "Amber Product Box",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-BA250",
      "unit": "units",
      "packSizeMilli": 250000,
      "purchasePriceMicros": 112500000,
      "unitCostMicros": 450000,
      "minimumStockMilli": 100000,
      "reorderPointMilli": 150000,
      "preferredOrderQtyMilli": 250000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 450000,
      "location": "E5",
      "active": true
    },
    {
      "id": "MAT-025",
      "name": "Large Product Box",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-BL200",
      "unit": "units",
      "packSizeMilli": 200000,
      "purchasePriceMicros": 118000000,
      "unitCostMicros": 590000,
      "minimumStockMilli": 80000,
      "reorderPointMilli": 120000,
      "preferredOrderQtyMilli": 200000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 590000,
      "location": "E6",
      "active": true
    },
    {
      "id": "MAT-026",
      "name": "Tin Sleeve",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-TS300",
      "unit": "units",
      "packSizeMilli": 300000,
      "purchasePriceMicros": 72000000,
      "unitCostMicros": 240000,
      "minimumStockMilli": 100000,
      "reorderPointMilli": 150000,
      "preferredOrderQtyMilli": 300000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 240000,
      "location": "E7",
      "active": true
    },
    {
      "id": "MAT-027",
      "name": "Shipping Carton",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-SC50",
      "unit": "units",
      "packSizeMilli": 50000,
      "purchasePriceMicros": 75000000,
      "unitCostMicros": 1500000,
      "minimumStockMilli": 20000,
      "reorderPointMilli": 30000,
      "preferredOrderQtyMilli": 50000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 1500000,
      "location": "E8",
      "active": true
    },
    {
      "id": "MAT-028",
      "name": "Wick Sticker",
      "category": "OTHER",
      "supplierId": "SUP-004",
      "supplierSku": "BW-WS2000",
      "unit": "units",
      "packSizeMilli": 2000000,
      "purchasePriceMicros": 36000000,
      "unitCostMicros": 18000,
      "minimumStockMilli": 500000,
      "reorderPointMilli": 800000,
      "preferredOrderQtyMilli": 2000000,
      "leadTimeDays": 6,
      "lastPurchaseUnitCostMicros": 18000,
      "location": "C3",
      "active": true
    },
    {
      "id": "MAT-029",
      "name": "Glue Dot",
      "category": "OTHER",
      "supplierId": "SUP-004",
      "supplierSku": "BW-GD2000",
      "unit": "units",
      "packSizeMilli": 2000000,
      "purchasePriceMicros": 24000000,
      "unitCostMicros": 12000,
      "minimumStockMilli": 500000,
      "reorderPointMilli": 800000,
      "preferredOrderQtyMilli": 2000000,
      "leadTimeDays": 6,
      "lastPurchaseUnitCostMicros": 12000,
      "location": "C4",
      "active": true
    },
    {
      "id": "MAT-030",
      "name": "Protective Insert",
      "category": "PACKAGING",
      "supplierId": "SUP-005",
      "supplierSku": "PP-PI250",
      "unit": "units",
      "packSizeMilli": 250000,
      "purchasePriceMicros": 80000000,
      "unitCostMicros": 320000,
      "minimumStockMilli": 80000,
      "reorderPointMilli": 120000,
      "preferredOrderQtyMilli": 250000,
      "leadTimeDays": 8,
      "lastPurchaseUnitCostMicros": 320000,
      "location": "E9",
      "active": true
    },
    {
      "id": "MAT-031",
      "name": "Sample Card",
      "category": "OTHER",
      "supplierId": null,
      "supplierSku": null,
      "unit": "units",
      "packSizeMilli": 500000,
      "purchasePriceMicros": 35000000,
      "unitCostMicros": 70000,
      "minimumStockMilli": 50000,
      "reorderPointMilli": 100000,
      "preferredOrderQtyMilli": 500000,
      "leadTimeDays": 5,
      "lastPurchaseUnitCostMicros": 70000,
      "location": "E10",
      "active": true
    }
  ],
  "products": [
    {
      "id": "PRD-001",
      "sku": "AJ-VAN",
      "name": "Amber Jar — Vanilla",
      "collection": "Signature",
      "candleType": "Jar",
      "containerSizeMl": 220,
      "waxWeightMilli": 180000,
      "fragrance": "Vanilla",
      "fragranceBps": 1000,
      "wickType": "Cotton Wick",
      "colour": "Ivory",
      "sellingPricePence": 2200,
      "targetStockMilli": 40000,
      "productionTriggerMilli": 25000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-002",
      "sku": "AJ-SAN",
      "name": "Amber Jar — Sandalwood",
      "collection": "Signature",
      "candleType": "Jar",
      "containerSizeMl": 220,
      "waxWeightMilli": 180000,
      "fragrance": "Sandalwood",
      "fragranceBps": 1000,
      "wickType": "Cotton Wick",
      "colour": "Natural",
      "sellingPricePence": 2400,
      "targetStockMilli": 35000,
      "productionTriggerMilli": 20000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-003",
      "sku": "TIN-LAV",
      "name": "Tin Candle — Lavender",
      "collection": "Travel",
      "candleType": "Tin",
      "containerSizeMl": 120,
      "waxWeightMilli": 100000,
      "fragrance": "Lavender",
      "fragranceBps": 900,
      "wickType": "Cotton Wick",
      "colour": "Purple",
      "sellingPricePence": 1400,
      "targetStockMilli": 50000,
      "productionTriggerMilli": 30000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-004",
      "sku": "LJ-SEA",
      "name": "Large Jar — Sea Salt",
      "collection": "Coastal",
      "candleType": "Jar",
      "containerSizeMl": 300,
      "waxWeightMilli": 250000,
      "fragrance": "Sea Salt",
      "fragranceBps": 1000,
      "wickType": "Wooden Wick",
      "colour": "Blue",
      "sellingPricePence": 2900,
      "targetStockMilli": 30000,
      "productionTriggerMilli": 18000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-005",
      "sku": "AJ-CED",
      "name": "Amber Jar — Cedar",
      "collection": "Signature",
      "candleType": "Jar",
      "containerSizeMl": 220,
      "waxWeightMilli": 180000,
      "fragrance": "Cedar",
      "fragranceBps": 1000,
      "wickType": "Cotton Wick",
      "colour": "Natural",
      "sellingPricePence": 2400,
      "targetStockMilli": 35000,
      "productionTriggerMilli": 20000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-006",
      "sku": "TIN-VAN",
      "name": "Tin Candle — Vanilla",
      "collection": "Travel",
      "candleType": "Tin",
      "containerSizeMl": 120,
      "waxWeightMilli": 100000,
      "fragrance": "Vanilla",
      "fragranceBps": 900,
      "wickType": "Cotton Wick",
      "colour": "Ivory",
      "sellingPricePence": 1400,
      "targetStockMilli": 50000,
      "productionTriggerMilli": 30000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-007",
      "sku": "LJ-ROS",
      "name": "Large Jar — Rose",
      "collection": "Botanical",
      "candleType": "Jar",
      "containerSizeMl": 300,
      "waxWeightMilli": 250000,
      "fragrance": "Rose",
      "fragranceBps": 1000,
      "wickType": "Wooden Wick",
      "colour": "Pink",
      "sellingPricePence": 3000,
      "targetStockMilli": 25000,
      "productionTriggerMilli": 15000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-008",
      "sku": "AJ-LAV",
      "name": "Amber Jar — Lavender",
      "collection": "Botanical",
      "candleType": "Jar",
      "containerSizeMl": 220,
      "waxWeightMilli": 180000,
      "fragrance": "Lavender",
      "fragranceBps": 1000,
      "wickType": "Cotton Wick",
      "colour": "Purple",
      "sellingPricePence": 2300,
      "targetStockMilli": 35000,
      "productionTriggerMilli": 20000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-009",
      "sku": "TIN-SEA",
      "name": "Tin Candle — Sea Salt",
      "collection": "Coastal",
      "candleType": "Tin",
      "containerSizeMl": 120,
      "waxWeightMilli": 100000,
      "fragrance": "Sea Salt",
      "fragranceBps": 900,
      "wickType": "Cotton Wick",
      "colour": "Blue",
      "sellingPricePence": 1500,
      "targetStockMilli": 45000,
      "productionTriggerMilli": 25000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    },
    {
      "id": "PRD-010",
      "sku": "LJ-SAN",
      "name": "Large Jar — Sandalwood",
      "collection": "Signature",
      "candleType": "Jar",
      "containerSizeMl": 300,
      "waxWeightMilli": 250000,
      "fragrance": "Sandalwood",
      "fragranceBps": 1000,
      "wickType": "Wooden Wick",
      "colour": "Natural",
      "sellingPricePence": 3200,
      "targetStockMilli": 25000,
      "productionTriggerMilli": 15000,
      "directLabourMinutesMilli": 4966,
      "packagingLabourMinutesMilli": 1448,
      "energyCostMicros": 250000,
      "overheadCostMicros": 600000,
      "sellingCostMicros": 450000,
      "active": true
    }
  ],
  "bomItems": [
    {
      "productId": "PRD-001",
      "materialId": "MAT-001",
      "quantityMilli": 180000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-004",
      "quantityMilli": 18000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-012",
      "quantityMilli": 200
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-014",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-017",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-020",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-024",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-001",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-001",
      "quantityMilli": 180000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-006",
      "quantityMilli": 18000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-014",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-017",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-020",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-024",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-002",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-002",
      "quantityMilli": 100000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-005",
      "quantityMilli": 9000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-016",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-019",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-022",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-026",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-003",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-002",
      "quantityMilli": 250000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-007",
      "quantityMilli": 25000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-011",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-013",
      "quantityMilli": 300
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-015",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-018",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-021",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-025",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-030",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-004",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-001",
      "quantityMilli": 180000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-008",
      "quantityMilli": 18000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-014",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-017",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-020",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-024",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-005",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-002",
      "quantityMilli": 100000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-004",
      "quantityMilli": 9000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-016",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-019",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-022",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-026",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-006",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-002",
      "quantityMilli": 250000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-009",
      "quantityMilli": 25000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-011",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-015",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-018",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-021",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-025",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-030",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-007",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-001",
      "quantityMilli": 180000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-005",
      "quantityMilli": 18000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-014",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-017",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-020",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-024",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-008",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-002",
      "quantityMilli": 100000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-007",
      "quantityMilli": 9000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-010",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-013",
      "quantityMilli": 150
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-016",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-019",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-022",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-026",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-009",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-002",
      "quantityMilli": 250000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-006",
      "quantityMilli": 25000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-011",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-015",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-018",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-021",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-023",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-025",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-030",
      "quantityMilli": 1000
    },
    {
      "productId": "PRD-010",
      "materialId": "MAT-028",
      "quantityMilli": 1000
    }
  ],
  "stockMovements": [
    {
      "id": "MOV-0001",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-001",
      "movementType": "purchase_receipt",
      "quantityMilli": 40000000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-001",
      "notes": "Opening demo balance",
      "sourceRow": 5
    },
    {
      "id": "MOV-0002",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-002",
      "movementType": "purchase_receipt",
      "quantityMilli": 18000000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-002",
      "notes": "Opening demo balance",
      "sourceRow": 6
    },
    {
      "id": "MOV-0003",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-003",
      "movementType": "purchase_receipt",
      "quantityMilli": 12000000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-003",
      "notes": "Opening demo balance",
      "sourceRow": 7
    },
    {
      "id": "MOV-0004",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-004",
      "movementType": "purchase_receipt",
      "quantityMilli": 4200000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-004",
      "notes": "Opening demo balance",
      "sourceRow": 8
    },
    {
      "id": "MOV-0005",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-005",
      "movementType": "purchase_receipt",
      "quantityMilli": 3100000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-005",
      "notes": "Opening demo balance",
      "sourceRow": 9
    },
    {
      "id": "MOV-0006",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-006",
      "movementType": "purchase_receipt",
      "quantityMilli": 900000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-006",
      "notes": "Opening demo balance",
      "sourceRow": 10
    },
    {
      "id": "MOV-0007",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-007",
      "movementType": "purchase_receipt",
      "quantityMilli": 2500000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-007",
      "notes": "Opening demo balance",
      "sourceRow": 11
    },
    {
      "id": "MOV-0008",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-008",
      "movementType": "purchase_receipt",
      "quantityMilli": 2200000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-008",
      "notes": "Opening demo balance",
      "sourceRow": 12
    },
    {
      "id": "MOV-0009",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-009",
      "movementType": "purchase_receipt",
      "quantityMilli": 1600000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-009",
      "notes": "Opening demo balance",
      "sourceRow": 13
    },
    {
      "id": "MOV-0010",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-010",
      "movementType": "purchase_receipt",
      "quantityMilli": 1800000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-010",
      "notes": "Opening demo balance",
      "sourceRow": 14
    },
    {
      "id": "MOV-0011",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-011",
      "movementType": "purchase_receipt",
      "quantityMilli": 380000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-011",
      "notes": "Opening demo balance",
      "sourceRow": 15
    },
    {
      "id": "MOV-0012",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-012",
      "movementType": "purchase_receipt",
      "quantityMilli": 700000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-012",
      "notes": "Opening demo balance",
      "sourceRow": 16
    },
    {
      "id": "MOV-0013",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-013",
      "movementType": "purchase_receipt",
      "quantityMilli": 500000,
      "unit": "g",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-013",
      "notes": "Opening demo balance",
      "sourceRow": 17
    },
    {
      "id": "MOV-0014",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-014",
      "movementType": "purchase_receipt",
      "quantityMilli": 310000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-014",
      "notes": "Opening demo balance",
      "sourceRow": 18
    },
    {
      "id": "MOV-0015",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-015",
      "movementType": "purchase_receipt",
      "quantityMilli": 95000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-015",
      "notes": "Opening demo balance",
      "sourceRow": 19
    },
    {
      "id": "MOV-0016",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-016",
      "movementType": "purchase_receipt",
      "quantityMilli": 460000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-016",
      "notes": "Opening demo balance",
      "sourceRow": 20
    },
    {
      "id": "MOV-0017",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-017",
      "movementType": "purchase_receipt",
      "quantityMilli": 290000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-017",
      "notes": "Opening demo balance",
      "sourceRow": 21
    },
    {
      "id": "MOV-0018",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-018",
      "movementType": "purchase_receipt",
      "quantityMilli": 110000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-018",
      "notes": "Opening demo balance",
      "sourceRow": 22
    },
    {
      "id": "MOV-0019",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-019",
      "movementType": "purchase_receipt",
      "quantityMilli": 450000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-019",
      "notes": "Opening demo balance",
      "sourceRow": 23
    },
    {
      "id": "MOV-0020",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-020",
      "movementType": "purchase_receipt",
      "quantityMilli": 620000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-020",
      "notes": "Opening demo balance",
      "sourceRow": 24
    },
    {
      "id": "MOV-0021",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-021",
      "movementType": "purchase_receipt",
      "quantityMilli": 240000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-021",
      "notes": "Opening demo balance",
      "sourceRow": 25
    },
    {
      "id": "MOV-0022",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-022",
      "movementType": "purchase_receipt",
      "quantityMilli": 720000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-022",
      "notes": "Opening demo balance",
      "sourceRow": 26
    },
    {
      "id": "MOV-0023",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-023",
      "movementType": "purchase_receipt",
      "quantityMilli": 1500000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-023",
      "notes": "Opening demo balance",
      "sourceRow": 27
    },
    {
      "id": "MOV-0024",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-024",
      "movementType": "purchase_receipt",
      "quantityMilli": 280000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-024",
      "notes": "Opening demo balance",
      "sourceRow": 28
    },
    {
      "id": "MOV-0025",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-025",
      "movementType": "purchase_receipt",
      "quantityMilli": 75000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-025",
      "notes": "Opening demo balance",
      "sourceRow": 29
    },
    {
      "id": "MOV-0026",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-026",
      "movementType": "purchase_receipt",
      "quantityMilli": 410000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-026",
      "notes": "Opening demo balance",
      "sourceRow": 30
    },
    {
      "id": "MOV-0027",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-027",
      "movementType": "purchase_receipt",
      "quantityMilli": 62000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-027",
      "notes": "Opening demo balance",
      "sourceRow": 31
    },
    {
      "id": "MOV-0028",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-028",
      "movementType": "purchase_receipt",
      "quantityMilli": 2400000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-028",
      "notes": "Opening demo balance",
      "sourceRow": 32
    },
    {
      "id": "MOV-0029",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-029",
      "movementType": "purchase_receipt",
      "quantityMilli": 1900000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-029",
      "notes": "Opening demo balance",
      "sourceRow": 33
    },
    {
      "id": "MOV-0030",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-030",
      "movementType": "purchase_receipt",
      "quantityMilli": 210000,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-030",
      "notes": "Opening demo balance",
      "sourceRow": 34
    },
    {
      "id": "MOV-0031",
      "date": "2026-06-01",
      "itemKind": "material",
      "itemId": "MAT-031",
      "movementType": "purchase_receipt",
      "quantityMilli": 0,
      "unit": "units",
      "batchId": null,
      "poNumber": null,
      "lotRef": "OPENING-MAT-031",
      "notes": "Opening demo balance",
      "sourceRow": 35
    },
    {
      "id": "MOV-0032",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-001",
      "movementType": "production_output",
      "quantityMilli": 28000,
      "unit": "units",
      "batchId": "BAT-001",
      "poNumber": null,
      "lotRef": "FG-2607-1",
      "notes": "Completed demo batch",
      "sourceRow": 36
    },
    {
      "id": "MOV-0033",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-002",
      "movementType": "production_output",
      "quantityMilli": 18000,
      "unit": "units",
      "batchId": "BAT-002",
      "poNumber": null,
      "lotRef": "FG-2607-2",
      "notes": "Completed demo batch",
      "sourceRow": 37
    },
    {
      "id": "MOV-0034",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-003",
      "movementType": "production_output",
      "quantityMilli": 42000,
      "unit": "units",
      "batchId": "BAT-003",
      "poNumber": null,
      "lotRef": "FG-2607-3",
      "notes": "Completed demo batch",
      "sourceRow": 38
    },
    {
      "id": "MOV-0035",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-004",
      "movementType": "production_output",
      "quantityMilli": 12000,
      "unit": "units",
      "batchId": "BAT-004",
      "poNumber": null,
      "lotRef": "FG-2607-4",
      "notes": "Completed demo batch",
      "sourceRow": 39
    },
    {
      "id": "MOV-0036",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-005",
      "movementType": "production_output",
      "quantityMilli": 20000,
      "unit": "units",
      "batchId": "BAT-005",
      "poNumber": null,
      "lotRef": "FG-2607-5",
      "notes": "Completed demo batch",
      "sourceRow": 40
    },
    {
      "id": "MOV-0037",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-006",
      "movementType": "production_output",
      "quantityMilli": 36000,
      "unit": "units",
      "batchId": "BAT-006",
      "poNumber": null,
      "lotRef": "FG-2607-6",
      "notes": "Completed demo batch",
      "sourceRow": 41
    },
    {
      "id": "MOV-0038",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-007",
      "movementType": "production_output",
      "quantityMilli": 9000,
      "unit": "units",
      "batchId": "BAT-007",
      "poNumber": null,
      "lotRef": "FG-2607-7",
      "notes": "Completed demo batch",
      "sourceRow": 42
    },
    {
      "id": "MOV-0039",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-008",
      "movementType": "production_output",
      "quantityMilli": 22000,
      "unit": "units",
      "batchId": "BAT-008",
      "poNumber": null,
      "lotRef": "FG-2607-8",
      "notes": "Completed demo batch",
      "sourceRow": 43
    },
    {
      "id": "MOV-0040",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-009",
      "movementType": "production_output",
      "quantityMilli": 30000,
      "unit": "units",
      "batchId": "BAT-009",
      "poNumber": null,
      "lotRef": "FG-2607-9",
      "notes": "Completed demo batch",
      "sourceRow": 44
    },
    {
      "id": "MOV-0041",
      "date": "2026-07-01",
      "itemKind": "product",
      "itemId": "PRD-010",
      "movementType": "production_output",
      "quantityMilli": 8000,
      "unit": "units",
      "batchId": "BAT-010",
      "poNumber": null,
      "lotRef": "FG-2607-10",
      "notes": "Completed demo batch",
      "sourceRow": 45
    },
    {
      "id": "MOV-0042",
      "date": "2026-08-02",
      "itemKind": "material",
      "itemId": "MAT-001",
      "movementType": "waste",
      "quantityMilli": -650000,
      "unit": "g",
      "batchId": "BAT-011",
      "poNumber": null,
      "lotRef": "WAX-260701",
      "notes": "Wax spillage",
      "sourceRow": 46
    },
    {
      "id": "MOV-0043",
      "date": "2026-08-03",
      "itemKind": "product",
      "itemId": "PRD-001",
      "movementType": "sample",
      "quantityMilli": -3000,
      "unit": "units",
      "batchId": "BAT-001",
      "poNumber": null,
      "lotRef": null,
      "notes": "Trade samples",
      "sourceRow": 47
    }
  ],
  "productionPlanLines": [
    {
      "line": 1,
      "productId": "PRD-001",
      "desiredQtyMilli": 100000,
      "notes": null
    },
    {
      "line": 2,
      "productId": "PRD-004",
      "desiredQtyMilli": 25000,
      "notes": null
    }
  ],
  "purchaseOrders": [
    {
      "poNumber": "PO-26001",
      "orderDate": "2026-07-25",
      "supplierId": "SUP-002",
      "status": "ordered",
      "expectedDate": "2026-08-05",
      "actualDate": null,
      "notes": "Demo PO",
      "lines": [
        {
          "lineNo": 1,
          "materialId": "MAT-006",
          "orderedQtyMilli": 2500000,
          "receivedQtyMilli": 2500000,
          "unitPriceMicros": 0,
          "unit": null
        }
      ],
      "sourceRow": 5
    },
    {
      "poNumber": "PO-26002",
      "orderDate": "2026-07-28",
      "supplierId": "SUP-003",
      "status": "part_received",
      "expectedDate": "2026-08-08",
      "actualDate": null,
      "notes": "72 units received; 36 outstanding",
      "lines": [
        {
          "lineNo": 1,
          "materialId": "MAT-015",
          "orderedQtyMilli": 108000,
          "receivedQtyMilli": 72000,
          "unitPriceMicros": 0,
          "unit": null
        }
      ],
      "sourceRow": 6
    },
    {
      "poNumber": "PO-26003",
      "orderDate": "2026-08-01",
      "supplierId": "SUP-005",
      "status": "ordered",
      "expectedDate": "2026-08-12",
      "actualDate": null,
      "notes": "Demo PO",
      "lines": [
        {
          "lineNo": 1,
          "materialId": "MAT-025",
          "orderedQtyMilli": 200000,
          "receivedQtyMilli": 200000,
          "unitPriceMicros": 0,
          "unit": null
        }
      ],
      "sourceRow": 7
    },
    {
      "poNumber": "PO-26004",
      "orderDate": "2026-08-03",
      "supplierId": "SUP-001",
      "status": "draft",
      "expectedDate": "2026-08-15",
      "actualDate": null,
      "notes": "Demo PO",
      "lines": [
        {
          "lineNo": 1,
          "materialId": "MAT-001",
          "orderedQtyMilli": 25000000,
          "receivedQtyMilli": 25000000,
          "unitPriceMicros": 0,
          "unit": null
        }
      ],
      "sourceRow": 8
    },
    {
      "poNumber": "PO-26005",
      "orderDate": "2026-07-10",
      "supplierId": "SUP-004",
      "status": "received",
      "expectedDate": "2026-07-18",
      "actualDate": "2026-07-17",
      "notes": "Demo PO",
      "lines": [
        {
          "lineNo": 1,
          "materialId": "MAT-010",
          "orderedQtyMilli": 1000000,
          "receivedQtyMilli": 1000000,
          "unitPriceMicros": 0,
          "unit": null
        }
      ],
      "sourceRow": 9
    },
    {
      "poNumber": "PO-26006",
      "orderDate": "2026-07-20",
      "supplierId": "SUP-005",
      "status": "cancelled",
      "expectedDate": "2026-07-30",
      "actualDate": null,
      "notes": "Demo PO",
      "lines": [
        {
          "lineNo": 1,
          "materialId": "MAT-021",
          "orderedQtyMilli": 500000,
          "receivedQtyMilli": 500000,
          "unitPriceMicros": 0,
          "unit": null
        }
      ],
      "sourceRow": 10
    }
  ],
  "batches": [
    {
      "id": "BAT-011",
      "productionDate": "2026-08-02",
      "productId": "PRD-001",
      "plannedQtyMilli": 50000,
      "actualProducedMilli": 48000,
      "rejectedMilli": 2000,
      "status": "completed",
      "operator": "M. Stone",
      "waxLot": "WAX-260701",
      "fragranceLot": "VAN-260615",
      "containerLot": "AJ-260620",
      "notes": "Demo production record",
      "sourceRow": 5
    },
    {
      "id": "BAT-012",
      "productionDate": "2026-08-03",
      "productId": "PRD-004",
      "plannedQtyMilli": 25000,
      "actualProducedMilli": 0,
      "rejectedMilli": 0,
      "status": "planned",
      "operator": "J. Lane",
      "waxLot": null,
      "fragranceLot": null,
      "containerLot": null,
      "notes": "Demo production record",
      "sourceRow": 6
    },
    {
      "id": "BAT-013",
      "productionDate": "2026-08-05",
      "productId": "PRD-003",
      "plannedQtyMilli": 60000,
      "actualProducedMilli": 57000,
      "rejectedMilli": 3000,
      "status": "completed",
      "operator": "J. Lane",
      "waxLot": "COCO-260701",
      "fragranceLot": "LAV-260620",
      "containerLot": "TIN-260618",
      "notes": "Demo production record",
      "sourceRow": 7
    },
    {
      "id": "BAT-014",
      "productionDate": "2026-08-09",
      "productId": "PRD-002",
      "plannedQtyMilli": 40000,
      "actualProducedMilli": 0,
      "rejectedMilli": 0,
      "status": "in_production",
      "operator": "M. Stone",
      "waxLot": "WAX-260701",
      "fragranceLot": "SAN-260702",
      "containerLot": "AJ-260620",
      "notes": "Demo production record",
      "sourceRow": 8
    }
  ],
  "wasteEvents": [
    {
      "id": "WST-001",
      "date": "2026-08-02",
      "batchId": "BAT-011",
      "productId": "PRD-001",
      "materialId": "MAT-001",
      "wasteType": "Wax Spillage",
      "lotRef": "WAX-260701",
      "quantityMilli": 650000,
      "unit": "g",
      "notes": "Pouring spill",
      "sourceRow": 5
    },
    {
      "id": "WST-002",
      "date": "2026-08-05",
      "batchId": "BAT-013",
      "productId": "PRD-003",
      "materialId": "MAT-016",
      "wasteType": "Damaged Jar",
      "lotRef": "TIN-260618",
      "quantityMilli": 3000,
      "unit": "units",
      "notes": "Dented tins",
      "sourceRow": 6
    },
    {
      "id": "WST-003",
      "date": "2026-08-05",
      "batchId": "BAT-013",
      "productId": "PRD-003",
      "materialId": "MAT-005",
      "wasteType": "Fragrance Loss",
      "lotRef": "LAV-260620",
      "quantityMilli": 20000,
      "unit": "g",
      "notes": "Transfer loss",
      "sourceRow": 7
    }
  ]
} as const;
