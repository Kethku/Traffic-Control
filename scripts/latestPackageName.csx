using System.Xml.Linq;

var nuspecPath = @"../TrafficControl.nuspec";

var nuspecXml = XElement.Load(nuspecPath);
var nuspecVersion = nuspecXml.Element("metadata").Element("version").Value;

Console.WriteLine($"TrafficControl.{nuspecVersion}.nupkg");
