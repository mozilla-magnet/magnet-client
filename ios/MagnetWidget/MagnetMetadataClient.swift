import Foundation
import SwiftSerializer

class MagnetObject: Serializable {
  var url: String;

  init(url: String) {
    self.url = url;
  }
}

class MagnetRequest: Serializable {
  var objects: Array<MagnetObject>;

  init(objects: Array<MagnetObject>) {
    self.objects = objects;
  }
}

class MagnetMetadataClient: NSObject {
  let metadataServerUrl: NSURL = NSURL(string: "https://tengam.org/api/v1/metadata")!;
  var onMetadata: (([String:AnyObject]) -> Void)!;

  init(onMetadata: ([String:AnyObject]) -> Void) {
    super.init();
    self.onMetadata = onMetadata;
  }

  func requestMetadata(url: String) {
    let request = NSMutableURLRequest(URL: metadataServerUrl);
    request.HTTPMethod = "POST";
    request.setValue("application/json", forHTTPHeaderField: "Content-Type");

    // Serialize request body.
    let magnetUrl = MagnetObject(url: url);
    var magnetObjects = [MagnetObject]();
    magnetObjects.append(magnetUrl);
    debugPrint("url", magnetUrl.toJsonString()!);

    let body = MagnetRequest(objects: magnetObjects);
    debugPrint("request", body.toJsonString()!);

    request.HTTPBody = body.toJson();

    let config = NSURLSessionConfiguration.defaultSessionConfiguration();
    let session = NSURLSession(configuration: config);
    let task = session.dataTaskWithRequest(request, completionHandler: {
      (data, response, error) in
      guard error == nil else {
        print("Error: metadata server error", error);
        return;
      }
      guard let responseData = data else {
        print("Error: did not receive data from metadata server");
        return;
      }
      do {
        guard let metadata = try NSJSONSerialization.JSONObjectWithData(responseData, options: .AllowFragments) as? [[String:AnyObject]] else {
          print("Error: JSON parse error. Crap");
          return;
        }
        self.onMetadata(metadata[0]);
        debugPrint("metadata ============== ", metadata[0]["title"] as! String);
        debugPrint("metadata ============== ", metadata[0]["description"] as! String);

      } catch {
        print("Error: JSON parse error");
      }
    });
    task.resume();
  }
}