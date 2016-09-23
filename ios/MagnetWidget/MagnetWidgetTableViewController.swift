import UIKit
import NotificationCenter

class MagnetWidgetTableViewController: UITableViewController, NCWidgetProviding {
  var scanner: MagnetScanner!;
  var metadataClient: MagnetMetadataClient?;
  var nearbyUrls: [String]!;
  var metadata: NSMutableDictionary!;

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
    nearbyUrls = [];
    metadata = NSMutableDictionary();

    updateSize();
  }

  override func viewWillAppear(animated: Bool) {
    debugPrint("viewWillAppear");
    super.viewWillAppear(animated);
    // Make the widget full width.
    if let superview = view.superview {
      var frame = superview.frame
      frame = CGRectMake(0, CGRectGetMinY(frame), CGRectGetWidth(frame) + CGRectGetMinX(frame), CGRectGetHeight(frame))
      superview.frame = frame
    }
    scanner.start();
    table.reloadData();
    updateSize();
  }

  override func viewWillDisappear(animated: Bool) {
    debugPrint("viewWillDisappear");
    super.viewWillDisappear(animated);
    scanner.stop();
    nearbyUrls = [];
    metadata.removeAllObjects();
  }

  func updateSize() {
    debugPrint("updateSize")
    var preferredSize = self.preferredContentSize;
    preferredSize.height = self.rowHeight * CGFloat(self.nearbyUrls.count);
    preferredContentSize = preferredSize;
  }

  func onItemFound(item: Dictionary<String, AnyObject>) {
    debugPrint("MagnetWidget - item found", item);

    let url = item["url"] as! String;
    guard nearbyUrls.contains(url) == false else { return }

    nearbyUrls.append(url);

    if (metadataClient == nil) {
      metadataClient = MagnetMetadataClient(onMetadata: onMetadata);
    }

    metadataClient!.requestMetadata(url);
  }

  func onMetadata(metadata: [String:AnyObject]) {
    debugPrint("OnMetadata", metadata);

    self.metadata.setValue(metadata, forKey: metadata["originalUrl"] as! String);

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
    debugPrint("Number of rows", self.nearbyUrls.count);
    return nearbyUrls.count;
  }

  override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    debugPrint("Displaying cell");
    let cell = tableView.dequeueReusableCellWithIdentifier(
      "MagnetCell", forIndexPath: indexPath) as! MagnetWidgetTableViewCell;
    cell.titleLabel!.textColor = UIColor.whiteColor();
    cell.urlLabel!.textColor = UIColor.grayColor();

    let url = nearbyUrls[indexPath.row];
    guard let metadata = self.metadata[url] else {
      return cell;
    }

    // Add Magnet URL to the table view.
    if let title = metadata["title"] as? String {
      cell.titleLabel!.text = title;
    }

    if let displayUrl = metadata["displayUrl"] as? String {
      cell.urlLabel!.text = displayUrl;
    }

    return cell;
  }

  override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
    let url:NSURL = NSURL(string:nearbyUrls[indexPath.row])!;
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