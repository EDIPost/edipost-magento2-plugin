<?php

namespace Edipost\Shipment\Block\Adminhtml\Config\View;

use \Magento\Framework\View\Element\Template;

class ShipmentConfig extends Template
{
    /**
     * @var \Magento\Framework\App\Request\Http
     */
    protected $_request;

    /**
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Edipost\Shipment\Helper\ConfigData $configData
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Edipost\Shipment\Helper\ConfigData $configData,
        array $data = []
    )
    {
        parent::__construct($context, $data);
        $this->configHelper = $configData;
    }

    /**
     * Get Printer Data from config.
     *
     * @return array
     */
    public function getPrinterData()
    {
        return $this->configHelper->printersData();
    }

}