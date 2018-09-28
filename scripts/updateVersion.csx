using System.Text.RegularExpressions;
using System.Xml.Linq;

var nuspecPath = @"../TrafficControl.nuspec";
var sourceVersionRegex = new Regex(@"^\[assembly: AssemblyVersion\(""(\d+\.\d+\.\d+)\.\d+""\)\]$");

var nuspecXml = XElement.Load(nuspecPath);
var nuspecVersion = nuspecXml.Element("metadata").Element("version");

var source = File.ReadLines(@"../TrafficControl/Properties/AssemblyInfo.cs");
var sourceVersion = source.Select(line => sourceVersionRegex.Match(line)).First(match => match.Success).Groups[1].Value;

if (sourceVersion != nuspecVersion.Value) {
    Console.WriteLine("Nuspec version does not match source version. Update?");

    while (true) {
        var answer = Console.ReadLine().ToLower();
        if (answer == "y" || answer == "yes") {
            nuspecVersion.Value = sourceVersion;
            nuspecXml.Save(nuspecPath);
            break;
        }
        if (answer == "n" || answer == "no") {
            break;
        }
        Console.WriteLine("Yes or No expected.");
    }
}
