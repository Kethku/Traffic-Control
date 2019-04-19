using System.Text.RegularExpressions;
using System.Xml.Linq;

var nuspecPath = @"../TrafficControl.nuspec";
var sourceVersionRegex = new Regex(@"^\[assembly: AssemblyVersion\(""(\d+\.\d+\.\d+)\.\d+""\)\]$");

var nuspecXml = XElement.Load(nuspecPath);
var nuspecVersion = nuspecXml.Element("metadata").Element("version");

var source = File.ReadLines(@"../TrafficControl/Properties/AssemblyInfo.cs");
var sourceVersion = source.Select(line => sourceVersionRegex.Match(line)).First(match => match.Success).Groups[1].Value;

if (sourceVersion != nuspecVersion.Value) {
    Console.WriteLine("Updating nuspec version.");

    nuspecVersion.Value = sourceVersion;
    nuspecXml.Save(nuspecPath);
}
