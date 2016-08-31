import UIKit
import NotificationCenter

class MagnetWidgetTableViewController: UITableViewController, NCWidgetProviding {
  var scanner: MagnetScanner!;
  var toDisplay: [String]!;

  @IBOutlet var table: UITableView!;

  var rowHeight: CGFloat {
    return 50;
  }

  override func viewDidLoad() {
    debugPrint("viewDidLoad");
    super.viewDidLoad();

    // Today widgets should have transparent background.
    table.backgroundColor = UIColor.clearColor();

    scanner = MagnetScanner(callback: onItemFound);
    toDisplay = [];

    updateSize();
  }

  override func viewWillAppear(animated: Bool) {
    debugPrint("viewWillAppear");
    super.viewWillAppear(animated);
    scanner.start();
    table.reloadData();
    updateSize();
  }

  override func viewWillDisappear(animated: Bool) {
    debugPrint("viewWillDisappear");
    super.viewWillDisappear(animated);
    scanner.stop();
    toDisplay = [];
  }

  func updateSize() {
    debugPrint("updateSize")
    var preferredSize = self.preferredContentSize;
    preferredSize.height = self.rowHeight * CGFloat(self.toDisplay.count);
    preferredContentSize = preferredSize;
  }

  func onItemFound(item: Dictionary<String, AnyObject>) {
    debugPrint("MagnetWidget - item found", item);

    let url = item["url"] as! String;
    guard toDisplay.contains(url) == false else { return }

    toDisplay.append(url);

    // Get url metadata.
    let metadataServer: String = "https://tengam.org/api/v1/metadata";
    guard let metadataServerUrl = NSURL(string: metadataServer) else {
      print("Error: wrong metadata server URL");
      return;
    }
    let request = NSMutableURLRequest(URL: metadataServerUrl);
    request.HTTPMethod = "POST";
    request.setValue("application/json", forHTTPHeaderField: "Content-Type");
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
      debugPrint("data", response, responseData);
      do {
        guard let metadata = try NSJSONSerialization.JSONObjectWithData(responseData, options: []) as? [String: AnyObject] else {
          print("Error: JSON parse error");
          return;
        }
        debugPrint("metadata", metadata);
      } catch {
        print("Error: JSON parse error");
      }
    });
    task.resume();

    table.reloadData();
    updateSize();
  }

  // MARK: - Widget Delegate

  func widgetPerformUpdateWithCompletionHandler(completionHandler: (NCUpdateResult) -> Void) {
    debugPrint("widgetPerformUpdateWithCompletionHandler");
    // It tells the widget to update itself.
    table.reloadData();
    completionHandler(NCUpdateResult.NewData);
  }

  // MARK: - Table view data source

  override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
    return 1;
  }

  override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    debugPrint("Number of rows", self.toDisplay.count);
    return toDisplay.count;
  }

  override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    debugPrint("Displaying cell");
    let cell = tableView.dequeueReusableCellWithIdentifier("MagnetCell", forIndexPath: indexPath);
    cell.textLabel!.textColor = UIColor.whiteColor();

    // Add Magnet URL to the table view.
    cell.textLabel!.text = toDisplay[indexPath.row];

    return cell;
  }

  override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let url:NSURL = NSURL(string:toDisplay[indexPath.row])!;
    extensionContext?.openURL(url, completionHandler: nil);
  }

  override func tableView(tableView: UITableView, willDisplayCell cell: UITableViewCell, forRowAtIndexPath indexPath: NSIndexPath) {
    cell.layer.backgroundColor = UIColor.clearColor().CGColor;
  }

  override func didReceiveMemoryWarning() {
    debugPrint("Memory warning");
    super.didReceiveMemoryWarning();
    // Dispose of any resources that can be recreated.
  }
}