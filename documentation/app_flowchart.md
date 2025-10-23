flowchart TD
    Start[Start] --> SignIn[Sign in]
    SignIn --> AuthCheck{Auth Successful?}
    AuthCheck -->|Yes| Dashboard[Dashboard]
    AuthCheck -->|No| SignIn
    Dashboard --> MenuSelection{Select Action}
    MenuSelection -->|Open Shift| OpenShift[Open Shift]
    MenuSelection -->|Manage Products| ProductMgmt[Product Management]
    MenuSelection -->|POS Interface| POSInterface[POS Interface]
    MenuSelection -->|View Reports| Reports[Reports]
    OpenShift --> Dashboard
    ProductMgmt --> ProdCats[Manage Categories]
    ProductMgmt --> OptionGroups[Manage Option Groups]
    ProductMgmt --> Products[Manage Products]
    ProdCats --> Dashboard
    OptionGroups --> Dashboard
    Products --> Dashboard
    POSInterface --> CategorySelect[Select Category]
    CategorySelect --> AddToCart[Add Product to Cart]
    AddToCart --> Payment[Open Payment Dialog]
    Payment --> ProcessPayment[Process Payment]
    ProcessPayment --> Receipt[Generate Receipt]
    Receipt --> Dashboard
    Reports --> TransHistory[Transaction History]
    Reports --> ShiftHistory[Shift History]
    TransHistory --> Dashboard
    ShiftHistory --> Dashboard
    Dashboard --> SignOut[Sign out]
    SignOut --> End[End]