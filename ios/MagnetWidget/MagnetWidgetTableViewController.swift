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
    self.table.backgroundColor = UIColor.clearColor();

    scanner = MagnetScanner(callback: onItemFound);
    toDisplay = [];

    updateSize();
  }

  override func viewWillAppear(animated: Bool) {
    debugPrint("viewWillAppear");
    super.viewWillAppear(animated);
    scanner.start();
    self.table.reloadData();
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
    self.preferredContentSize = preferredSize;
  }

  func onItemFound(item: Dictionary<String, AnyObject>) {
    debugPrint("MagnetWidget - item found", item);

    let url = item["url"] as! String;
    guard toDisplay.contains(url) == false else { return }

    toDisplay.append(url);

    self.table.reloadData();
    updateSize();
  }

  // MARK: - Widget Delegate

  func widgetPerformUpdateWithCompletionHandler(completionHandler: (NCUpdateResult) -> Void) {
    debugPrint("widgetPerformUpdateWithCompletionHandler");
    // It tells the widget to update itself.
    self.table.reloadData();
    completionHandler(NCUpdateResult.NewData);
  }

  // MARK: - Table view data source

  override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
    return 1;
  }

  override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    debugPrint("Number of rows", self.toDisplay.count);
    return self.toDisplay.count;
  }

  override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
    debugPrint("Displaying cell");
    let cell = tableView.dequeueReusableCellWithIdentifier("MagnetCell", forIndexPath: indexPath);
    cell.textLabel!.textColor = UIColor.whiteColor();

    // Add Magnet URL to the table view.
    cell.textLabel!.text = toDisplay[indexPath.row];

    return cell;
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