<?php
namespace Edipost\Shipment\Block\Adminhtml\Order\View;

use \Magento\Framework\View\Element\Template;
use Edipost\Shipment\Helper\View as helperView;
require_once( helperView::getDirectory() . DIRECTORY_SEPARATOR . 'Lib' . DIRECTORY_SEPARATOR . 'php-rest-client' . DIRECTORY_SEPARATOR . 'EdipostService.php' );
use EdipostService\EdipostService;
use EdipostService\ServiceConnection\WebException;

class Shipment extends Template
{
    /**
     * @var \Magento\Framework\App\Request\Http
     */
    protected $_request;

    /**
     * @var \Magento\Sales\Model\Order
     */
    protected $_order;

    /**
     * @var int
     */
    protected $_order_id;

    /**
     * @var \EdipostService\EdipostService
     */
    protected $_api;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Framework\App\Request\Http $request
     * @param \Edipost\Shipment\Helper\ConfigData $configData
     * @param \Magento\Store\Model\Information $storeInfo
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\App\Request\Http $request,
        \Edipost\Shipment\Helper\ConfigData $configData,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->_request = $request;
        $this->configHelper = $configData;
        $apiData = $this->configHelper->apiData();
        $this->_api = new EdipostService( $apiData['api_token'], $apiData['api_endpoint'] );
        $this->_order_id = $this->getOrderId();
        $this->_order = helperView::getOrderById($this->_order_id);
    }

    /**
     * Retrieves current order Id.
     *
     * @return integer
     */
    private function getOrderId()
    {
        return (int) $this->getRequest()->getParam('order_id');
    }

    /**
     * Get ajax url for request.
     *
     * @return array
     */
    public function getAjaxUrl()
    {
        return [
            'open'=> $this->getUrl('edipost/ajax/openedipost/'),
            'create'=> $this->getUrl('edipost/ajax/createshipment/'),
            ];
    }

    /**
     * Get Printer Data  from config.
     *
     * @return array
     */
    public function getPrinterData()
    {
        return $this->configHelper->printersData();
    }

    public function getIdOrder()
    {
        return $this->_order_id;
    }

    /**
     * Is module enable.
     *
     * @return boolean
     */
    public function isModuleEnable()
    {
        return $this->configHelper->isEnabled();
    }

    /**
     * return shipping methods from Edipost Api.
     *
     * @return object
     */
    public function getShipingMethods(){
        $items = [];
        $error = '';
        $shippingData = $this->getShipingAdress();
        $options = [];

        foreach ($this->_order->getAllItems() as $product) {
            if(!($weight = $product->getWeight())){
                $weight = 1;
            }
            $items[] = [
                'weight' => $weight,
                'length' => '0',
                'width'  => '0',
                'height' => '100'
            ];
        }

        try {
            $products =  $this->_api->getAvailableProducts( $shippingData['fromZipCode'], $shippingData['fromCountryCode'], $shippingData['toZipCode'], $shippingData['toCountryCode'], $items );
//            $products =  $this->_api->getAvailableProducts( (string)$shippingData['fromZipCode'], $shippingData['fromCountryCode'], (string)'1337', 'NO', $items ); // test data
            foreach ($products as $product){
                $options[] = [
                    'id' => $product->getId(),
                    'name' => $product->getName()
                ];
            }
        } catch (WebException $exception){
            $error = $exception->getMessage();
        }

        $obj = new \stdClass();
        $obj->options = $options;
        $obj->error = $error;
        return $obj;
    }

    /**
     * Get Shipping Address(from and to).
     *
     * @return array
     */

    private function getShipingAdress(){

        $shippingAddressArray = $this->_order->getShippingAddress()->getData();

        $toCountryCode = $shippingAddressArray['country_id'];
        $toZipCode = $shippingAddressArray['postcode'];

        $shippingData = $this->configHelper->getShippingData();

        return [
            'toCountryCode' => $toCountryCode,
            'toZipCode' => $toZipCode,
            'fromCountryCode' => $shippingData['fromCountryCode'],
            'fromZipCode' => $shippingData['fromZipCode'],
        ];
    }

}