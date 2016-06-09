﻿namespace System
open System.Reflection

[<assembly: AssemblyTitleAttribute("Informedica.GenUnit.App")>]
[<assembly: AssemblyProductAttribute("Informedica.GenUnit.App")>]
[<assembly: AssemblyCompanyAttribute("halcwb")>]
[<assembly: AssemblyDescriptionAttribute("Client Server App to calculate and convert units")>]
[<assembly: AssemblyVersionAttribute("0.0.2")>]
[<assembly: AssemblyFileVersionAttribute("0.0.2")>]
do ()

module internal AssemblyVersionInformation =
    let [<Literal>] Version = "0.0.2"
    let [<Literal>] InformationalVersion = "0.0.2"
