<?php

namespace Edipost\Shipment\Controller\Adminhtml\Ajax;

use Edipost\Shipment\Helper\View as helperView;
use EdipostService\Client\Builder\ConsigneeBuilder;
use EdipostService\Client\Builder\ConsignmentBuilder;
use EdipostService\Client\Item;
use EdipostService\EdipostService;
use EdipostService\ServiceConnection\WebException;

require_once(helperView::getDirectory() . DIRECTORY_SEPARATOR . 'Lib' . DIRECTORY_SEPARATOR . 'php-rest-client' . DIRECTORY_SEPARATOR . 'EdipostService.php');


class CreateShipment extends \Magento\Backend\App\AbstractAction {

	protected $configHelper;

	protected $_api;
	protected $_apiData;


	/**
	 * @param \Magento\Backend\App\Action\Context $context
	 * @param \Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory
	 * @param \Edipost\Shipment\Helper\ConfigData $configData
	 * @param \Edipost\Shipment\Helper\ShipmentWorker $shipmentWorker
	 * @param \Magento\Framework\Filesystem $filesystem
	 * @param \Magento\Framework\App\Filesystem\DirectoryList $directoryList
	 * @param \Magento\Store\Model\StoreManagerInterface $storeManager
	 */
	public function __construct(
		\Magento\Backend\App\Action\Context $context,
		\Magento\Framework\Controller\Result\JsonFactory $resultJsonFactory,
		\Edipost\Shipment\Helper\ConfigData $configData,
		\Edipost\Shipment\Helper\ShipmentWorker $shipmentWorker,
		\Magento\Framework\Filesystem $filesystem,
		\Magento\Framework\App\Filesystem\DirectoryList $directoryList,
		\Magento\Store\Model\StoreManagerInterface $storeManager
	) {
		parent::__construct($context);
		$this->resultJsonFactory = $resultJsonFactory;
		$this->configHelper = $configData;
		$this->shipmentWorker = $shipmentWorker;
		$this->filesystem = $filesystem;
		$this->directoryList = $directoryList;
		$this->storeManager = $storeManager;

		$this->_apiData = $this->configHelper->apiData();
		$this->_api = new EdipostService($this->_apiData ['api_token'], $this->_apiData ['api_endpoint']);
	}

	/**
	 * @return \Magento\Framework\Controller\Result\Json
	 */
	public function execute() {
		if (!$this->getRequest()->isAjax()) {
			return false;
		}

		$result = $this->resultJsonFactory->create();
		$error = '';

		$order_id = $this->getRequest()->getParam('order_id', 0);
		$product_id = $this->getRequest()->getParam('product_id', 0);
		$service_id = $this->getRequest()->getParam('service_id', 0);
		$e_alert = $this->getRequest()->getParam('e_alert', 0);
		$reference = $this->getRequest()->getParam('reference', '');

		$order = helperView::getOrderById($order_id);


		//
		// Create consignee
		//
		$shippingAddressArray = $order->getShippingAddress()->getData();

		$builder = new ConsigneeBuilder();

		$company_name = $shippingAddressArray['firstname'] . ' ' . $shippingAddressArray['lastname'];
		if ($shippingAddressArray['company']) {
			$company_name = $shippingAddressArray['company'];
		}

		$consignee = $builder
			->setCompanyName($company_name)
			//->setCustomerNumber((string)$order->getCustomerId())
			->setCustomerNumber('0')
			->setPostAddress($shippingAddressArray['street'])
			->setPostZip($shippingAddressArray['postcode'])
			->setPostCity($shippingAddressArray['city'])
			->setStreetAddress($shippingAddressArray['street'])
			->setStreetZip($shippingAddressArray['postcode'])
			->setStreetCity($shippingAddressArray['city'])
			->setContactName($shippingAddressArray['firstname'] . ' ' . $shippingAddressArray['lastname'])
			->setContactEmail($shippingAddressArray['email'])
			->setContactPhone($shippingAddressArray['telephone'])
			->setContactCellPhone($shippingAddressArray['telephone'])
			->setContactTelefax($shippingAddressArray['fax'])
			->setCountry($shippingAddressArray['country_id'])
			->build();

		$pdf = '';
		$pdf_raw = '';
		$pdf_content = '';

		try {
			$newConsignee = $this->_api->createConsignee($consignee);
			$consigneeId = $newConsignee->ID;

			$builder = new ConsignmentBuilder();

			$consignor = $this->_api->getDefaultConsignor();

			$consignment = $builder
				->setConsignorID($consignor->ID)
				->setConsigneeID($consigneeId)
				->setProductID($product_id)
				->setTransportInstructions('')
				->setContentReference($reference)
				->setInternalReference('');

			foreach ($order->getAllItems() as $product) {
				$weight = 1;
				$length = 0;
				$width = 0;
				$height = 0;

				if ($product->getWeight()) {
					$weight = $product->getWeight();
				}

				$consignment->addItem(new Item($weight, $length, $width, $height));
			}

			if ($e_alert && in_array(intval($product_id), [8, 457, 16])) {
				// Add SMS warning
				if ($shippingAddressArray['telephone']) {
					$consignment->addService(5, array('EMSG_SMS_NUMBER' => $shippingAddressArray['telephone']));
				}

				// Add e-mail warning
				if ($shippingAddressArray['email']) {
					$consignment->addService(6, array('EMSG_EMAIL' => $shippingAddressArray['email']));
				}
			}

			// Add correct service if product is REK
			if( ($product_id == 454 || $product_id == 747) && $service_id > 0 ) {
				$consignment->addService( intval($service_id) );
			}

			$newConsignment = $this->_api->createConsignment($consignment->build());


			//
			// Create new shipment under Magento order (not the same as consignment in Edipost)
			//
			$objectManager = \Magento\Framework\App\ObjectManager::getInstance();


			$package_weight = 0;

			$convertOrder = $objectManager->create('\Magento\Sales\Model\Convert\Order');
			$shipment = $convertOrder->toShipment($order);

			$package = array();

			$packaging = array(
				'items' => array()
			);

			$subtotal = 0;
			foreach ($order->getAllItems() AS $orderItem) {
				if (!$orderItem->getQtyOrdered() || $orderItem->getIsVirtual()) {
					continue;
				}
				$qtyShipped = $orderItem->getQtyOrdered();
				$shipmentItem = $convertOrder->itemToShipmentItem($orderItem)->setQty($qtyShipped);
				$packaging['items'][$shipmentItem->getOrderItemId()] = array(
					'qty' => $shipmentItem->getQty(),
					'custom_value' => $shipmentItem->getPrice(),
					'price' => $shipmentItem->getPrice(),
					'name' => $shipmentItem->getName(),
					'weight' => $shipmentItem->getWeight(),
					'product_id' => $shipmentItem->getProductId(),
					'order_item_id' => $shipmentItem->getOrderItemId()
				);

				$package_weight += $shipmentItem->getWeight();

				$subtotal += $shipmentItem->getRowTotal();
				$shipment->addItem($shipmentItem);
			}

			if (empty($packaging['items'])) {
				$error = __('No items to ship');
			}

			$packaging['params'] = array(
				'container' => '',
				'weight' => $package_weight,
				'custom_value' => $subtotal,
				'weight_units' => 'KILOGRAM',
				'dimension_units' => 'CENTIMETER',
				'content_type' => '',
				'content_type_other' => ''
			);
			$package[] = $packaging;

			$shipment->setPackages($package);
			$shipment->register();
			$shipment->getOrder()->setIsInProcess(true);

			try {
				$shipment->save();
				$shipment->getOrder()->save();
				$notify = $objectManager->create('Magento\Shipping\Model\ShipmentNotifier');
				$notify->notify($shipment);
				$shipment->save();
			} catch (\Exception $e) {
				$error = $e->getMessage();
			}

			$this->shipmentWorker->createTrackData($shipment, $newConsignment->shipmentNumber, 'custom', 'edipost');


			//
			// Print label
			//
			if ($product_id == 761 || $product_id == 763) {
				$pdf_raw = $this->_api->printConsignmentZpl($newConsignment->id);
			} else {
				$pdf_content = $this->_api->printConsignment($newConsignment->id);
			}

			$media = $this->filesystem->getDirectoryWrite($this->directoryList::MEDIA);
			$file__media_path = "edipost" . DIRECTORY_SEPARATOR . $newConsignment->id . "_consignment.pdf";

			$media->writeFile($file__media_path, $pdf_content);
			$pdf = $this->storeManager->getStore()->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA) . $file__media_path;


		} catch (WebException $exception) {    // Errors from edipost client library
			$error = $exception->getMessage();
			$result->setHttpResponseCode(400);

		} catch (\Exception $exception) {    // Other errors
			$error = $exception->getMessage();
			$result->setHttpResponseCode(500);
		}


		return $result->setData([
			'error' => $error,
			'product_id' => $product_id,
			'pdf' => $pdf,
			'pdf_raw' => $pdf_raw,
		]);
	}
}